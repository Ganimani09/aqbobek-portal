import { NextRequest, NextResponse } from "next/server";
import { studentGradesDb } from "../data";

export async function GET(request: NextRequest) {
  const className = request.nextUrl.searchParams.get("className");

  if (!className) {
    return NextResponse.json(
      { error: "Query parameter 'className' is required." },
      { status: 400 }
    );
  }

  const classRecords = studentGradesDb.filter((item) => item.class === className);

  const students = classRecords
    .map((item) => {
      const subjectAverages = item.grades.map((grade) => grade.average);
      const averageScore =
        subjectAverages.reduce((sum, value) => sum + value, 0) / subjectAverages.length;

      return {
        studentId: item.studentId,
        student: item.student,
        class: item.class,
        average: Number(averageScore.toFixed(2)),
        rank: item.rank,
        totalPoints: item.totalPoints,
        subjects: item.grades,
      };
    })
    .sort((a, b) => b.average - a.average);

  const radarBySubjectMap = new Map<string, number[]>();
  classRecords.forEach((student) => {
    student.grades.forEach((subjectGrade) => {
      const current = radarBySubjectMap.get(subjectGrade.subject) ?? [];
      current.push(subjectGrade.average);
      radarBySubjectMap.set(subjectGrade.subject, current);
    });
  });

  const classSubjectRadar = Array.from(radarBySubjectMap.entries()).map(([subject, averages]) => {
    const classAverage = averages.reduce((sum, value) => sum + value, 0) / averages.length;
    return {
      subject,
      average: Number(classAverage.toFixed(2)),
    };
  });

  return NextResponse.json({
    className,
    totalStudents: students.length,
    students,
    classSubjectRadar,
  });
}
