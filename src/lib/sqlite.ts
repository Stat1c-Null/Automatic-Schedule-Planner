import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let _db: Database.Database | null = null;

function db(): Database.Database {
  // establish db connection, return conneciton if exists, find db (parallel folder to lib db/rmp_ksu.sqlite3)
  if (_db) return _db;
  const dbPath = path.join(process.cwd(), "src", "data", "rmp_ksu.sqlite");
  // if not found
  if (!fs.existsSync(dbPath))
    throw new Error(`SQLite file not found at ${dbPath}`);
  // do not create new db if not foundw
  const instance = new Database(dbPath, {
    readonly: true,
    fileMustExist: true,
  });
  // docs reocommend WAL, only query, no write
  instance.pragma("journal_mode = WAL");
  instance.pragma("query_only = ON");
  _db = instance;
  return _db;
}

// QUERIES
const stmts = {
  teachersByDept: () =>
    db().prepare(
      `SELECT teacher_id, name, department, avg_rating, avg_difficulty, num_ratings, would_take_again_percent
       FROM teachers
       WHERE department = ?
       ORDER BY avg_rating DESC, teacher_id
       LIMIT ? OFFSET ?`,
    ),

  teacherIdsByClass: () =>
    db().prepare(
      `SELECT DISTINCT teacher_id
       FROM teacher_courses
       WHERE class_code = ?
       ORDER BY teacher_id
       LIMIT ? OFFSET ?`,
    ),

  teachersByIds_start: (n: number) => {
    const placeholders = Array.from({ length: n }, () => "?").join(",");
    return db().prepare(
      `SELECT teacher_id, name, department, avg_rating, avg_difficulty, num_ratings, would_take_again_percent
       FROM teachers
       WHERE teacher_id IN (${placeholders})`,
    );
  },

  tagsByTeacher: () =>
    db().prepare(
      `SELECT tag, n
       FROM teacher_tag_counts
       WHERE teacher_id = ?
       ORDER BY n DESC, tag
       LIMIT ? OFFSET ?`,
    ),

  teachersByExactName: () =>
    db().prepare(
      `SELECT teacher_id, name, department
       FROM teachers
       WHERE name = ? COLLATE NOCASE
       ORDER BY teacher_id
       LIMIT ? OFFSET ?`,
    ),

  teachersByNamePrefix: () =>
    db().prepare(
      `SELECT teacher_id, name, department
       FROM teachers
       WHERE name LIKE ? COLLATE NOCASE
       ORDER BY name, teacher_id
       LIMIT ? OFFSET ?`,
    ),
};

export const sqlite = { db, stmts };
