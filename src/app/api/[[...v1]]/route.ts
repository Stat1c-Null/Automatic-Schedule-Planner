// API ENDPOINTS for rmpxcourses
// note.. do note change [[...v1]] -- needed to allow dynamic routing
import { NextRequest } from "next/server";
import {
  getTeachersByClass,
  getTeachersByDept,
  getTags,
  getCourses,
  getTeacherByName,
} from "@/lib/repo";

export const runtime = "nodejs";

/*
    examples
    GET /api/v1/rmp?class_code=CSE1321
    GET /api/v1/rmp?department=CS
    GET /api/v1/rmp/tags?teacher_id=VGVhY2hlci0yMzkyNzkw
    GET /api/v1/rmp?name=Smith
    GET /api/v1/courses?program=Computer%20Science%20B.S.
*/

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname.split("/").slice(3); // after /api/v1/
  const params = url.searchParams;

  // case /api/v1   -- not proper request
  if (!path[0]) {
    return new Response("No endpoint requested", { status: 400 });
  }

  //rmp?param=smthn
  if (path[0] === "rmp" && !path[1]) {
    if (params.get("class_code"))
      return Response.json(await getTeachersByClass(params.get("class_code")));
    if (params.get("department"))
      return Response.json(await getTeachersByDept(params.get("department")));
    if (params.get("name"))
      return Response.json(await getTeacherByName(params.get("name")));
  }

  //rmp/tags?teacher_id=asdasdasdas
  if (path[0] === "rmp" && path[1] === "tags")
    return Response.json(await getTags(params.get("teacher_id")));

  //courses?program=Computer Science
  if (path[0] === "courses")
    return Response.json(await getCourses(params.get("program")));

  // else not found
  return new Response("Not found", { status: 404 });
}
