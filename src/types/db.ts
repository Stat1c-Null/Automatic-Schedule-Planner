// Raw DB/CSV row shapes (mirror SQLite + CSV)

export type TeacherRow = {
  teacher_id: string;
  name: string;
  department: string;
  avg_rating: number | null;
  avg_difficulty: number | null;
  num_ratings: number | null;
  would_take_again_percent?: number | null;
};

export type TeacherIdRow = {
  teacher_id: string;
};

export type TeacherCourseRow = {
  teacher_id: string;
  class_code: string;
  n_ratings?: number | null;
  avg_clarity?: number | null;
  avg_difficulty?: number | null;
  would_take_again?: number | null; // note 0-1 not 0 - 100 as in TeacherRow
};

export type TagRow = {
  teacher_id: string;
  tag: string;
  n: number;
};

export type CourseCsvRow = {
  program_title: string;
  course_name: string;
  catalog_id: number;
  core_id: number;
  course_id: number;
};
