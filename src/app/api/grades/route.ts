import { NextRequest, NextResponse } from "next/server";
import { studentGradesDb } from "./data";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "Query parameter 'studentId' is required." },
      { status: 400 }
    );
  }

  const studentRecord = studentGradesDb.find((item) => item.studentId === studentId);

  if (!studentRecord) {
    return NextResponse.json(
      {
        error: "Student not found.",
        availableStudentIds: studentGradesDb.map((item) => item.studentId),
      },
      { status: 404 }
    );
  }

  const responsePayload = {
    student: studentRecord.student,
    class: studentRecord.class,
    grades: studentRecord.grades,
    totalPoints: studentRecord.totalPoints,
    rank: studentRecord.rank,
    totalStudents: studentRecord.totalStudents,
  };

  return NextResponse.json(responsePayload);
}
