import os
import csv
import json
from typing import List, Optional, Tuple
import pandas as pd
from pathlib import Path
import re

RAW_DIR = Path("raw_data_rmp")
COMMENTS_DIR = RAW_DIR / "teachers_comments"
PROFESSOR_LIST_FILE = RAW_DIR / "professor_list.json"
ERROR_LOG = Path("error_file.csv")

# HELPER FOR parsing teacherinfo from filename


def _parse_teacher_from_path(p: Path) -> Tuple[str, str]:
    # convert filename ie Amy_Hrinsin_VGVhY2hlci0yODY4Nzgw.json
    # to a pair of teacher_id, teacher_name
    # remove json and get list of separated by _
    stem = p.stem
    parts = stem.split("_")
    if len(parts) < 2:
        raise ValueError(f"Unparsable id/name from {p.name}")

    teacher_id_from_file = parts[-1]
    # teacher name as is before stripping -- ie Amy Hrinsin
    teacher_name_from_file = " ".join(parts[:-1]).replace(" ", " ").strip()

    return teacher_id_from_file, teacher_name_from_file


def _safe_bool(x) -> Optional[int]:
    # make sure value true/false matches correctly, if not remove
    # convert 0 to 1 or None if not a defined value
    if x is None:
        return None
    if isinstance(x, bool):
        return int(x)
    if isinstance(x, (int, float)) and x in (0, 1):
        return int(x)
    s = str(x).strip().lower()
    if s in {"true", "t", "yes", "y", "1"}:
        return 1
    if s in {"false", "f", "no", "n", "0"}:
        return 0
    return None

# normalize the name and department


def _nn(s: str) -> str:
    return " ".join(str(s).strip().split()).lower()


# normalize class codes for grouping/search (ex: "ACCT-2102" -> "ACCT2102", "acct 2102" -> "ACCT2102")
def _norm_class_code(s: Optional[str]) -> str:
    if s is None:
        return ""
    s = str(s).strip().upper()
    # remove spaces/underscores/hyphens
    s = re.sub(r"[\s\-_]+", "", s)
    return s


def load_professor_list() -> pd.DataFrame:
    # loads all professors from lisdt, sends to dataframe
    with open(PROFESSOR_LIST_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        data = [data]

    df = pd.DataFrame(data)

    df["name_norm"] = df["name"].map(_nn)
    df["dept_norm"] = df["department"].map(_nn)

    return df


def load_teacher_comments() -> pd.DataFrame:
    # iterate through teachers_comments directories, return dataframe
    # store erros loading data from files
    file_errors: List[Tuple[str, str]] = []

    records = []
    for dept_dir in COMMENTS_DIR.iterdir():
        if dept_dir.is_dir():
            # iterate through fil subtree ie Department/*teachers.json
            for f in dept_dir.glob("*.json"):
                try:
                    # parse from path, create stronger linkage
                    t_id_file, t_name_file = _parse_teacher_from_path(f)
                except Exception as e:
                    print(f"[PARSE_ERROR] {f}: {e}")
                    file_errors.append((str(f), f"[PARSE_ERROR] {e}"))
                    continue
                try:
                    with open(f, "r", encoding="utf-8") as fh:
                        # each file may contain one or many comments
                        data = json.load(fh)
                except Exception as e:
                    # save this
                    print(f"Error reading {f}: {e}")
                    # save errors eto list of tuples, file - error
                    file_errors.append((str(f), f"[READ_ERROR] {e}"))
                    continue

                if isinstance(data, dict):
                    data = [data]
                # store department, teachername, teacherid with data (RMP has no TeacherID -> teacher name linkage provided)
                for entry in data:
                    # CLEAN DATA FROM is for credit, is online, would take again
                    # convert to 0/1 instead of true,false also checks for typos/inconsistency
                    entry["is_for_credit"] = _safe_bool(
                        entry.get("is_for_credit"))
                    entry["is_online"] = _safe_bool(entry.get("is_online"))
                    entry["would_take_again"] = _safe_bool(
                        entry.get("would_take_again"))

                    # extra info
                    entry["department"] = dept_dir.name
                    entry["source_file"] = str(f)
                    # keep file derived and actual JSON derived teacher id
                    entry["teacher_id"] = t_id_file
                    entry["teacher_name_file"] = t_name_file
                    records.append(entry)

    if file_errors:
        with open(ERROR_LOG, "a", encoding="utf-8", newline="") as ef:
            writer = csv.writer(ef)
            for row in file_errors:
                writer.writerow(["FILE_ERROR"] + list(row))

    df = pd.DataFrame(records)

    # order columns for better readability
    preferred_cols = [
        "teacher_id", "teacher_name_file", "department",
        "class", "date_posted", "difficulty_rating", "clarity_rating",
        "student_grade", "attendance_status", "is_for_credit", "is_online",
        "comment_likes", "comment_dislikes", "textbook_use", "would_take_again",
        "rating_tags", "comment", "source_file"
    ]
    # preferred columns first, then all remaining columns after
    cols = [c for c in preferred_cols if c in df.columns] + \
        [c for c in df.columns if c not in preferred_cols]

    return df[cols]


def build_teachers_df(ratings_df: pd.DataFrame, profs_df: pd.DataFrame) -> pd.DataFrame:
    # Create table for teachers, using TEACHER_ID as primary key - link to professor aggregates
    # join teachers with normalized name AND normalized department (hopefully no teachers with same name in two different departments)
    # reports one-many and missing joins

    # note og profesor dataframe did NOT have actual teahcer_ids
    # return only proefessor info if no data with ratings for that professor
    if ratings_df.empty:
        return pd.DataFrame(columns=[
            "teacher_id", "name", "department", "classes",
            "avg_rating", "avg_difficulty", "num_ratings", "would_take_again_percent"
        ])

    # copy of teacchers from file name inference
    teachers = (
        ratings_df[["teacher_id", "teacher_name_file", "department"]]
        .drop_duplicates()
        .rename(columns={"teacher_name_file": "name"})
    ).copy()

    cls = (
        ratings_df[["teacher_id", "class"]]
        .dropna()
        .astype({"class": str})
        .groupby("teacher_id")["class"]
        .apply(lambda s: sorted(set(s.str.strip())))
        .reset_index(name="classes")
    )
    teachers = teachers.merge(cls, on="teacher_id", how="left")

    # normalize the names
    teachers["name_norm"] = teachers["name"].map(_nn)
    teachers["dept_norm"] = teachers["department"].map(_nn)

    # join professor aggregate to teachers df with
    profs = profs_df.copy()
    if not profs.empty:
        profs_slim = profs[[
            "name_norm", "dept_norm",
            "avg_rating", "avg_difficulty", "num_ratings", "would_take_again_percent",
            "name", "department"
        ]].copy()

        joined = teachers.merge(
            profs_slim,
            on=["name_norm", "dept_norm"],
            how="left",
            suffixes=("", "_profs")
        )

        # use name from Professor List
        joined["name"] = joined["name_profs"].fillna(joined["name"])
        joined["department"] = joined["department_profs"].fillna(
            joined["department"])

        teachers_df = joined[[
            "teacher_id", "name", "department", "classes",
            "avg_rating", "avg_difficulty", "num_ratings", "would_take_again_percent"
        ]].drop_duplicates(subset=["teacher_id"])
    else:
        teachers_df = teachers[[
            "teacher_id", "name", "department", "classes"
        ]].copy()
        teachers_df["avg_rating"] = pd.NA
        teachers_df["avg_difficulty"] = pd.NA
        teachers_df["num_ratings"] = pd.NA
        teachers_df["would_take_again_percent"] = pd.NA

    # Same id with multiple teacher nams or departments
    dup = (
        ratings_df.groupby("teacher_id")[["teacher_name_file", "department"]]
        .nunique()
        .reset_index()
    )
    inconsistent = dup[(dup["teacher_name_file"] > 1)
                       | (dup["department"] > 1)]
    if not inconsistent.empty:
        with open(ERROR_LOG, "a", encoding="utf-8", newline="") as ef:
            writer = csv.writer(ef)
            for _, row in inconsistent.iterrows():
                writer.writerow(["TID_INCONSISTENT_NAME_DEPT", row["teacher_id"],
                                row["teacher_name_file"], row["department"]])
        print(
            f"[WARN] {len(inconsistent)} teacher_id(s) have inconsistent name/department across files (logged).")

    return teachers_df


def build_teacher_course_metrics(ratings_df: pd.DataFrame) -> pd.DataFrame:
    # aggregated metrics per teacher_id and per class taught
    if ratings_df.empty:
        return pd.DataFrame(columns=[
            "teacher_id", "class_code", "n_ratings", "avg_clarity",
            "avg_difficulty", "would_take_again_rate"
        ])

    r = ratings_df.copy()

    # convert numeric fields to numeric types if not already numeric
    for col in ["clarity_rating", "difficulty_rating", "would_take_again"]:
        if col in r.columns:
            r[col] = pd.to_numeric(r[col], errors="coerce")

    # normalize class codes for consistent grouping and downstream lookup
    r["class_code"] = r["class"].astype(str).map(_norm_class_code)

    grp = r.groupby(["teacher_id", "class_code"], dropna=False)
    df = grp.agg(
        n_ratings=("comment", "count"),
        avg_clarity=("clarity_rating", "mean"),
        avg_difficulty=("difficulty_rating", "mean"),
        would_take_again_rate=("would_take_again", "mean"),
    ).reset_index()

    return df.sort_values(["teacher_id", "class_code"]).reset_index(drop=True)


def build_rating_tags(ratings_df: pd.DataFrame) -> pd.DataFrame:
    # split the rating_tags using -- delimiter and normalize into rows
    # columns returned: teacher_id, class_code, tag
    if ratings_df.empty or "rating_tags" not in ratings_df.columns:
        return pd.DataFrame(columns=["teacher_id", "class_code", "tag"])

    tmp = ratings_df[["teacher_id", "class"]].copy()
    tmp["class_code"] = tmp["class"].astype(str).map(_norm_class_code)

    rows = []
    # iterate over original df to keep tags as-is (case, spelling, etc)
    for _, row in ratings_df.iterrows():
        tags = row.get("rating_tags")
        if pd.isna(tags):
            continue
        tid = row.get("teacher_id")
        cls = _norm_class_code(row.get("class"))
        for t in str(tags).split("--"):
            tag = t.strip()
            if tag:
                rows.append((tid, cls, tag))
    return pd.DataFrame(rows, columns=["teacher_id", "class_code", "tag"])


def build_tag_aggregates(tags_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    # cumulative counts for tags, both per teacher and per (teacher, class)
    if tags_df.empty:
        t = pd.DataFrame(columns=["teacher_id", "tag", "n"])
        tc = pd.DataFrame(columns=["teacher_id", "class_code", "tag", "n"])
        return t, tc

    teacher_tag_counts = (
        tags_df.groupby(["teacher_id", "tag"]).size()
        .reset_index(name="n")
        .sort_values(["teacher_id", "n"], ascending=[True, False])
        .reset_index(drop=True)
    )

    teacher_course_tag_counts = (
        tags_df.groupby(["teacher_id", "class_code", "tag"]).size()
        .reset_index(name="n")
        .sort_values(["teacher_id", "class_code", "n"], ascending=[True, True, False])
        .reset_index(drop=True)
    )

    return teacher_tag_counts, teacher_course_tag_counts


def load_all() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    # return teachers dataframe (with ID as primary key)
    profs = load_professor_list()
    ratings = load_teacher_comments()

    # is empty return empty dataset
    if ratings.empty:
        print("Ratings Empty")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

    teachers = build_teachers_df(ratings, profs)

    # build table for teacher_courses (metrics per teacher_id, class_code)
    teacher_courses = build_teacher_course_metrics(ratings)

    # build tags and tag aggregates (teacher level and teacher-course level)
    tags_df = build_rating_tags(ratings)
    teacher_tag_counts, teacher_course_tag_counts = build_tag_aggregates(
        tags_df)

    # return only dataframes, schema and sql write will be in a diff file
    return teachers, ratings, teacher_courses, teacher_tag_counts, teacher_course_tag_counts


def preview_dataframes():
    # preview data to make sure it works
    teachers, ratings, teacher_courses, teacher_tag_counts, teacher_course_tag_counts = load_all()

    print("\nTEACHER DATA normalized")
    print(teachers.head(10), "\n")
    print(teachers.iloc[4])

    print("RATING/COMMENT DATA")
    print(ratings.head(), "\n")
    print(ratings.iloc[1])

    print("\nTEACHER_COURSES (metrics per teacher/class)")
    print(teacher_courses.head(10), "\n")

    print("\nTEACHER_TAG_COUNTS (cumulative per teacher)")
    print(teacher_tag_counts.head(10), "\n")

    print("\nTEACHER_COURSE_TAG_COUNTS (cumulative per teacher+class)")
    print(teacher_course_tag_counts.head(10), "\n")

    print(f"Loaded {len(teachers)} professors, {len(ratings)} ratings.")

# keep schema build/save in other file, this only loads, cleans, and builds dataframes


if __name__ == "__main__":
    preview_dataframes()
