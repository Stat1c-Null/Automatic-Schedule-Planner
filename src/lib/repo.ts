import { sqlite } from "@/lib/sqlite";
import { loadCoursesCsv } from "@/lib/csv";
import { TeacherRow, TagRow, CourseCsvRow } from "@/types/db";
import { CourseDTO, TagDTO, TeacherDTO, TeacherSummaryDTO } from "@/types/dto";

// Convert Raw Rows to DTOs
function toTeacherDTO(r: TeacherRow): TeacherDTO {
  return {
    id: r.teacher_id,
    name: r.name,
    department: r.department,
    avg_rating: r.avg_rating,
    avg_difficulty: r.avg_difficulty,
    num_ratings: r.num_ratings ?? 0,
  };
}

function toTeacherSummaryDTO(r: {
  teacher_id: string;
  name: string;
  department: string;
}): TeacherSummaryDTO {
  return { id: r.teacher_id, name: r.name, department: r.department };
}

function toCourseDTO(r: CourseCsvRow): CourseDTO {
  return {
    program_title: r.program_title,
    course: {
      name: r.course_name,
      catalog_id: r.catalog_id,
      core_id: r.core_id,
      course_id: r.course_id,
    },
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// has options for pagination, Not necessary rn
export async function getTeachersByDept(
  dept: string | null,
  opts?: { limit?: number; offset?: number },
): Promise<TeacherDTO[]> {
  if (!dept) return [];
  const limit = clamp(opts?.limit ?? 20, 1, 50);
  const offset = Math.max(0, opts?.offset ?? 0);
  const stmt = sqlite.stmts.teachersByDept();
  const rows = stmt.all(dept.trim(), limit, offset) as TeacherRow[];
  return rows.map(toTeacherDTO);
}

// Super important one -- how we recommend teachers from Course classCode
export async function getTeachersByClass(
  classCode: string | null,
  opts?: { limit?: number; offset?: number },
): Promise<TeacherDTO[]> {
  // return empty if no classCode
  if (!classCode) return [];
  const limit = clamp(opts?.limit ?? 50, 1, 100);
  const offset = Math.max(0, opts?.offset ?? 0);

  const idsStmt = sqlite.stmts.teacherIdsByClass();
  const idRows = idsStmt.all(classCode.trim(), limit, offset) as {
    teacher_id: string;
  }[];
  if (idRows.length === 0) return [];

  const ids = idRows.map((r) => r.teacher_id);
  const inStmt = sqlite.stmts.teachersByIds_start(ids.length);
  const teacherRows = inStmt.all(...ids) as TeacherRow[];

  teacherRows.sort((a, b) => {
    const ar = a.avg_rating ?? -Infinity;
    const br = b.avg_rating ?? -Infinity;
    if (br !== ar) return br - ar;
    return a.teacher_id.localeCompare(b.teacher_id);
  });

  return teacherRows.map(toTeacherDTO);
}

export async function getTeacherByName(
  name: string | null,
  opts?: { limit?: number; offset?: number; exact?: boolean },
): Promise<TeacherSummaryDTO[]> {
  if (!name) return [];
  const limit = clamp(opts?.limit ?? 20, 1, 50);
  const offset = Math.max(0, opts?.offset ?? 0);
  const exact = opts?.exact ?? false;

  if (exact) {
    const stmt = sqlite.stmts.teachersByExactName();
    const rows = stmt.all(name.trim(), limit, offset) as {
      teacher_id: string;
      name: string;
      department: string;
    }[];
    return rows.map(toTeacherSummaryDTO);
  }

  const exactStmt = sqlite.stmts.teachersByExactName();
  const exactRows = exactStmt.all(name.trim(), limit, offset) as {
    teacher_id: string;
    name: string;
    department: string;
  }[];
  if (exactRows.length > 0) return exactRows.map(toTeacherSummaryDTO);

  const prefixStmt = sqlite.stmts.teachersByNamePrefix();
  const prefixRows = prefixStmt.all(`${name.trim()}%`, limit, offset) as {
    teacher_id: string;
    name: string;
    department: string;
  }[];
  return prefixRows.map(toTeacherSummaryDTO);
}

export async function getTags(
  teacherId: string | null,
  opts?: { limit?: number; offset?: number },
): Promise<TagDTO[]> {
  if (!teacherId) return [];
  const limit = clamp(opts?.limit ?? 20, 1, 100);
  const offset = Math.max(0, opts?.offset ?? 0);

  const stmt = sqlite.stmts.tagsByTeacher();
  const rows = stmt.all(teacherId, limit, offset) as TagRow[];
  return rows.map((r) => ({ tag: r.tag, n: r.n }));
}

export async function getCourses(
  program?: string | null,
): Promise<CourseDTO[]> {
  const rows = await loadCoursesCsv();
  if (!program) return rows.map(toCourseDTO);
  const p = program.trim();
  return rows.filter((r) => r.program_title === p).map(toCourseDTO);
}
