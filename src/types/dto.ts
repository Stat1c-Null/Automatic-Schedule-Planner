// What Will be Seen in Public API

export type TeacherDTO = {
  id: string;
  name: string;
  department: string;
  avg_rating: number | null;
  avg_difficulty: number | null;
  num_ratings: number | null;
};

export type TeacherSummaryDTO = {
  id: string;
  name: string;
  department: string;
};

export type TagDTO = {
  tag: string;
  n: number;
};

export type CourseDTO = {
  program_title: string; // same as department ion courses most of the time ie Computer Science/also in csv after CS4505: here
  course: {
    name: string;
    catalog_id: number;
    core_id: number;
    course_id: number;
  };
};
