
# RMP × Courses API – Minimal Usage Guide

All endpoints return JSON and require no authentication.
Use relative paths directly from your Next.js app with `fetch()`.
---
## Demo (After npm run dev) -- [http://localhost:3000/tests](http://localhost:3000/tests)


## 1. Teachers by Course Code
```ts
await fetch("/api/v1/rmp?class_code=CSE1321")
````

**Response**

```json
[
  {
    "id": "VGVhY2hlci0yMTg1Nzc2",
    "name": "Enda Sullivan",
    "department": "Computer Science",
    "avg_rating": 4.9,
    "avg_difficulty": 2.4,
    "num_ratings": 59
  },
  {
    "id": "VGVhY2hlci0yOTA4MjM0",
    "name": "Dmitri Nunes",
    "department": "Computer Science",
    "avg_rating": 4.8,
    "avg_difficulty": 2.5,
    "num_ratings": 12
  }
]
```

---

## 2. Teachers by Department

```ts
await fetch("/api/v1/rmp?department=Computer%20Science")
```

**Response**

```json
[
  {
    "id": "VGVhY2hlci0xNDg4MDY3",
    "name": "Jeff Chastine",
    "department": "Computer Science",
    "avg_rating": 5,
    "avg_difficulty": 2.2,
    "num_ratings": 19
  },
  {
    "id": "VGVhY2hlci0xNjczODQ5",
    "name": "Andrew Knowles",
    "department": "Computer Science",
    "avg_rating": 5,
    "avg_difficulty": 4,
    "num_ratings": 1
  }
]
```

---

## 3. Tags for a Teacher

```ts
await fetch("/api/v1/rmp/tags?teacher_id=VGVhY2hlci0yMzkyNzkw")
```

**Response**

```json
[
  { "tag": "Clear grading criteria", "n": 6 },
  { "tag": "Lots of homework", "n": 5 },
  { "tag": "Participation matters", "n": 4 },
  { "tag": "Lecture heavy", "n": 3 },
  { "tag": "Gives good feedback", "n": 2 },
  { "tag": "Tough grader", "n": 2 },
  { "tag": "Accessible outside class", "n": 1 },
  { "tag": "Amazing lectures", "n": 1 },
  { "tag": "Beware of pop quizzes", "n": 1 },
  { "tag": "Caring", "n": 1 },
  { "tag": "Inspirational", "n": 1 },
  { "tag": "Online Savvy", "n": 1 },
  { "tag": "Respected", "n": 1 }
]
```

---

## 4. Teacher by Name

```ts
await fetch("/api/v1/rmp?name=Min%20Wang")
```

**Response**

```json
[
  {
    "id": "VGVhY2hlci0yMzkyNzkw",
    "name": "Min Wang",
    "department": "Mathematics"
  }
]
```

---

## 5. Courses by Program

```ts
await fetch("/api/v1/courses?program=Computer%20Science%20B.S.")
```

**Response**

```json
[
  {
    "program_title": "Computer Science B.S.",
    "course": {
      "name": "CSE 1321: Programming and Problem Solving I",
      "catalog_id": 79,
      "core_id": 79236,
      "course_id": 128867
    }
  },
  {
    "program_title": "Computer Science B.S.",
    "course": {
      "name": "CSE 1321L: Programming and Problem Solving I Laboratory",
      "catalog_id": 79,
      "core_id": 79236,
      "course_id": 128858
    }
  },
  {
    "program_title": "Computer Science B.S.",
    "course": {
      "name": "CSE 1322: Programming and Problem Solving II",
      "catalog_id": 79,
      "core_id": 79236,
      "course_id": 128868
    }
  }
]
```

---

## Expected Data Types (see src/types/dto.ts)

```ts
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

export type TagDTO = { tag: string; n: number };

export type CourseDTO = {
  program_title: "Computer Science B.S.";
  course: {
    name: string;
    catalog_id: number;
    core_id: number;
    course_id: number;
  };
};
```

---

## Minimal Example in FrontEnd Code

```tsx
"use client";
import { useEffect, useState } from "react";
import type { TeacherDTO } from "@/types/dto";

export default function Example() {
  const [data, setData] = useState<TeacherDTO[] | null>(null);

  useEffect(() => {
    fetch("/api/v1/rmp?class_code=CSE1321")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
