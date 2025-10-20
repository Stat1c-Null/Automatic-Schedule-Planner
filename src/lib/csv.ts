// lib/csv.ts
import fs from "node:fs";
import path from "node:path";
import { CourseCsvRow } from "@/types/db";

/**
 * Naive CSV loader for the controlled file format:
 * Header: program_title,course_name,catalog_id,core_id,course_id
 * Assumes no quoted commas in fields. Lines may be CRLF or LF.
 */

let _coursesCache: CourseCsvRow[] | null = null;

function toNum(x: string): number {
  const n = Number(x.trim());
  return Number.isFinite(n) ? n : NaN;
}

function normalizeLine(line: string): string {
  // Remove BOM on first line if present and trim whitespace
  return line.replace(/^\uFEFF/, "").trim();
}

export async function loadCoursesCsv(): Promise<CourseCsvRow[]> {
  if (_coursesCache) return _coursesCache;

  const csvPath = path.join(process.cwd(), "src", "data", "courses.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).map(normalizeLine).filter(Boolean);

  if (lines.length === 0) {
    _coursesCache = [];
    return _coursesCache;
  }

  // Validate header (tolerate spacing after commas)
  const header = lines[0].split(",").map((s) => s.trim().toLowerCase());
  const expected = [
    "program_title",
    "course_name",
    "catalog_id",
    "core_id",
    "course_id",
  ];
  const headerOk =
    header.length === expected.length &&
    expected.every((h, i) => header[i] === h);
  const startIdx = headerOk ? 1 : 0; // allow files already without header

  const rows: CourseCsvRow[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Simple split; safe for your dataset (no commas in fields)
    const parts = line.split(",").map((s) => s.trim());
    if (parts.length < 5) continue; // skip malformed

    const [program_title, course_name, catalog_id, core_id, course_id] = parts;

    rows.push({
      program_title,
      course_name,
      catalog_id: toNum(catalog_id),
      core_id: toNum(core_id),
      course_id: toNum(course_id),
    });
  }

  _coursesCache = rows;
  return _coursesCache;
}

/**
 * Optional helper if you want direct filtering without repo.ts:
 */
export async function loadCoursesByProgram(program?: string | null) {
  const all = await loadCoursesCsv();
  if (!program) return all;
  const p = program.trim();
  return all.filter((r) => r.program_title === p);
}
