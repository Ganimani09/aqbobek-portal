export type Trend = "up" | "down" | "stable";

export type SubjectGrades = {
  subject: string;
  grades: number[];
  average: number;
  trend: Trend;
};

export type StudentGradesRecord = {
  studentId: string;
  student: string;
  class: string;
  grades: SubjectGrades[];
  totalPoints: number;
  rank: number;
  totalStudents: number;
};

export const studentGradesDb: StudentGradesRecord[] = [
  {
    studentId: "st-001",
    student: "Алибек Сейтов",
    class: "10А",
    grades: [
      { subject: "Математика", grades: [5, 4, 5, 3, 4, 5], average: 4.3, trend: "up" },
      { subject: "Физика", grades: [3, 3, 4, 3, 2, 3], average: 3.0, trend: "down" },
      { subject: "История", grades: [4, 5, 5, 4, 5, 4], average: 4.5, trend: "stable" },
      { subject: "Химия", grades: [4, 3, 4, 4, 3, 4], average: 3.7, trend: "stable" },
      { subject: "Биология", grades: [5, 5, 4, 5, 5, 5], average: 4.8, trend: "up" },
      { subject: "Русский язык", grades: [3, 4, 3, 3, 4, 3], average: 3.3, trend: "down" },
    ],
    totalPoints: 340,
    rank: 7,
    totalStudents: 28,
  },
  {
    studentId: "st-002",
    student: "Малика Умарова",
    class: "10А",
    grades: [
      { subject: "Математика", grades: [5, 5, 4, 5, 5, 5], average: 4.8, trend: "up" },
      { subject: "Физика", grades: [4, 4, 5, 4, 4, 5], average: 4.3, trend: "up" },
      { subject: "История", grades: [5, 5, 5, 4, 5, 5], average: 4.8, trend: "stable" },
      { subject: "Химия", grades: [4, 5, 4, 5, 4, 5], average: 4.5, trend: "up" },
      { subject: "Биология", grades: [5, 5, 5, 5, 4, 5], average: 4.8, trend: "stable" },
      { subject: "Русский язык", grades: [4, 5, 4, 4, 5, 4], average: 4.3, trend: "up" },
    ],
    totalPoints: 392,
    rank: 2,
    totalStudents: 28,
  },
  {
    studentId: "st-003",
    student: "Дамир Турсунов",
    class: "10А",
    grades: [
      { subject: "Математика", grades: [4, 4, 3, 4, 4, 3], average: 3.7, trend: "stable" },
      { subject: "Физика", grades: [3, 4, 3, 3, 4, 3], average: 3.3, trend: "stable" },
      { subject: "История", grades: [4, 4, 4, 5, 4, 4], average: 4.2, trend: "up" },
      { subject: "Химия", grades: [3, 3, 4, 3, 4, 3], average: 3.3, trend: "stable" },
      { subject: "Биология", grades: [4, 4, 4, 4, 5, 4], average: 4.2, trend: "up" },
      { subject: "Русский язык", grades: [4, 3, 4, 3, 4, 3], average: 3.5, trend: "stable" },
    ],
    totalPoints: 318,
    rank: 11,
    totalStudents: 28,
  },
  {
    studentId: "st-004",
    student: "Сабина Рахматова",
    class: "10А",
    grades: [
      { subject: "Математика", grades: [5, 4, 5, 5, 4, 5], average: 4.7, trend: "up" },
      { subject: "Физика", grades: [4, 4, 4, 5, 4, 4], average: 4.2, trend: "stable" },
      { subject: "История", grades: [5, 5, 4, 5, 5, 5], average: 4.8, trend: "up" },
      { subject: "Химия", grades: [4, 4, 5, 4, 5, 4], average: 4.3, trend: "up" },
      { subject: "Биология", grades: [5, 5, 5, 4, 5, 5], average: 4.8, trend: "stable" },
      { subject: "Русский язык", grades: [4, 4, 5, 4, 4, 5], average: 4.3, trend: "up" },
    ],
    totalPoints: 386,
    rank: 3,
    totalStudents: 28,
  },
  {
    studentId: "st-005",
    student: "Руслан Абдулаев",
    class: "10А",
    grades: [
      { subject: "Математика", grades: [3, 3, 4, 3, 3, 4], average: 3.3, trend: "stable" },
      { subject: "Физика", grades: [2, 3, 3, 2, 3, 3], average: 2.7, trend: "down" },
      { subject: "История", grades: [4, 3, 4, 4, 3, 4], average: 3.7, trend: "stable" },
      { subject: "Химия", grades: [3, 3, 3, 4, 3, 3], average: 3.2, trend: "stable" },
      { subject: "Биология", grades: [4, 4, 3, 4, 4, 3], average: 3.7, trend: "up" },
      { subject: "Русский язык", grades: [3, 3, 3, 4, 3, 3], average: 3.2, trend: "stable" },
    ],
    totalPoints: 286,
    rank: 19,
    totalStudents: 28,
  },
];
