# to_sqlite.py
import argparse
import sqlite3
from pathlib import Path
import pandas as pd

import data_clean as dc

# SCHEMA .. HERE IS A PLANTUML DIAGRAM
SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS teachers (
  teacher_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  avg_rating REAL,
  avg_difficulty REAL,
  num_ratings INTEGER,
  would_take_again_percent REAL
);

CREATE TABLE IF NOT EXISTS teacher_courses (
  teacher_id TEXT NOT NULL REFERENCES teachers(teacher_id),
  class_code TEXT NOT NULL,
  n_ratings INTEGER,
  avg_clarity REAL,
  avg_difficulty REAL,
  would_take_again_rate REAL,
  PRIMARY KEY (teacher_id, class_code)
);

CREATE TABLE IF NOT EXISTS teacher_tag_counts (
  teacher_id TEXT NOT NULL REFERENCES teachers(teacher_id),
  tag TEXT NOT NULL,
  n INTEGER NOT NULL,
  PRIMARY KEY (teacher_id, tag)
);

CREATE TABLE IF NOT EXISTS teacher_course_tag_counts (
  teacher_id TEXT NOT NULL REFERENCES teachers(teacher_id),
  class_code TEXT NOT NULL,
  tag TEXT NOT NULL,
  n INTEGER NOT NULL,
  PRIMARY KEY (teacher_id, class_code, tag)
);

-- helpful lookups
CREATE INDEX IF NOT EXISTS idx_teacher_courses_class ON teacher_courses(class_code);
CREATE INDEX IF NOT EXISTS idx_teacher_courses_teacher ON teacher_courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_tag_counts_teacher ON teacher_tag_counts(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_course_tag_counts ON teacher_course_tag_counts(teacher_id, class_code);
"""

# table to keep comments.. It is off for now (not actually using it)
RAW_RATINGS_SQL = """
CREATE TABLE IF NOT EXISTS ratings_raw (
  -- keep opaque ids as-is (may have '=' padding in base64)
  teacher_id TEXT NOT NULL,
  teacher_name_file TEXT,
  department TEXT,
  class TEXT,
  date_posted TEXT,
  difficulty_rating REAL,
  clarity_rating REAL,
  student_grade TEXT,
  attendance_status TEXT,
  is_for_credit INTEGER,
  is_online INTEGER,
  comment_likes INTEGER,
  comment_dislikes INTEGER,
  textbook_use REAL,
  would_take_again INTEGER,
  rating_tags TEXT,
  comment TEXT,
  source_file TEXT
);
CREATE INDEX IF NOT EXISTS idx_ratings_raw_teacher ON ratings_raw(teacher_id);
CREATE INDEX IF NOT EXISTS idx_ratings_raw_class ON ratings_raw(class);
"""


def _open_conn(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA temp_store=MEMORY;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def _create_schema(conn: sqlite3.Connection, include_raw: bool = False):
    # create table schema, optionally include raw comments, keep for false for now
    conn.executescript(SCHEMA_SQL)
    if include_raw:
        conn.executescript(RAW_RATINGS_SQL)
    conn.commit()


def _clear_tables(conn: sqlite3.Connection, include_raw: bool = False):
    # wipe data, keep schema and tables
    tbls = [
        "teacher_course_tag_counts",
        "teacher_tag_counts",
        "teacher_courses",
        "teachers",
    ]
    if include_raw:
        tbls.insert(0, "ratings_raw")
    for t in tbls:
        conn.execute(f"DELETE FROM {t};")
    conn.commit()


def _df_to_sql(conn: sqlite3.Connection, name: str, df: pd.DataFrame):
    # pandas handles NaN -> NULL; assume table already exists with right columns
    if df.empty:
        return
    df.to_sql(name, conn, if_exists="append", index=False)


def write_sqlite(db_path: str, include_raw: bool = False):
    # build frames from your loader (teachers, ratings, teacher_courses, teacher_tag_counts, teacher_course_tag_counts)
    teachers, ratings, teacher_courses, teacher_tag_counts, teacher_course_tag_counts = dc.load_all()

    dbp = Path(db_path)
    conn = _open_conn(dbp)
    try:
        _create_schema(conn, include_raw=include_raw)
        _clear_tables(conn, include_raw=include_raw)

        # only SELECT columns that are in target tables
        teachers_out = teachers[[
            "teacher_id", "name", "department",
            "avg_rating", "avg_difficulty", "num_ratings", "would_take_again_percent"
        ]].copy()

        teacher_courses_out = teacher_courses[[
            "teacher_id", "class_code", "n_ratings",
            "avg_clarity", "avg_difficulty", "would_take_again_rate"
        ]].copy()

        teacher_tag_counts_out = teacher_tag_counts[[
            "teacher_id", "tag", "n"]].copy()
        teacher_course_tag_counts_out = teacher_course_tag_counts[[
            "teacher_id", "class_code", "tag", "n"]].copy()

        # write Pratnes first for Foreign keys
        _df_to_sql(conn, "teachers", teachers_out)
        _df_to_sql(conn, "teacher_courses", teacher_courses_out)
        _df_to_sql(conn, "teacher_tag_counts", teacher_tag_counts_out)
        _df_to_sql(conn, "teacher_course_tag_counts",
                   teacher_course_tag_counts_out)

        # is optional for all comments
        if include_raw and not ratings.empty:
            ratings_out = ratings[[
                "teacher_id", "teacher_name_file", "department", "class",
                "date_posted", "difficulty_rating", "clarity_rating",
                "student_grade", "attendance_status", "is_for_credit", "is_online",
                "comment_likes", "comment_dislikes", "textbook_use", "would_take_again",
                "rating_tags", "comment", "source_file"
            ]].copy()
            _df_to_sql(conn, "ratings_raw", ratings_out)

        conn.commit()

        # quick counts
        cur = conn.cursor()
        for t in ["teachers", "teacher_courses", "teacher_tag_counts", "teacher_course_tag_counts"] + (["ratings_raw"] if include_raw else []):
            cur.execute(f"SELECT COUNT(*) FROM {t}")
            n = cur.fetchone()[0]
            print(f"{t}: {n}")
    finally:
        conn.close()


def main():
    p = argparse.ArgumentParser(
        description="convert dataframes into sqlite3 database")
    p.add_argument("--db", required=True,
                   help="path to sqlite file (ex: rmp_snapshot.sqlite)")
    p.add_argument("--include-raw", action="store_true",
                   help="also write ratings_raw table (optional)")
    args = p.parse_args()
    write_sqlite(args.db, include_raw=args.include_raw)


if __name__ == "__main__":
    main()
