# Data Info

This directory takes raw data that I scraped from rate my professors website for KSU and organizes it, then saves to a .sqlite file.

### Using

run (in this directory)

    python -m venv .venv

then (Windows)

    .venv/Scripts/activate

or (Linux/Mac)

    source .venv/bin/activate

then

    pip install -r requirements.txt

to run dataframe preview

    python data_clean.py

to build sqlite3 database for snapshot of raw_data_rmp

    python to_sqlite.py --db filename.sqlite [optional] --include_raw

### Schema

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
