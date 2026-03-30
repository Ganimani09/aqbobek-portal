export type TeacherInput = {
  id: string;
  name: string;
  subjects: string[];
  busySlots: string[]; // Format: "day-time", e.g. "1-08:00"
};

export type SubjectInput =
  | string
  | {
      name: string;
      lessonsPerWeek?: number;
    };

export type ScheduleEntry = {
  className: string;
  subject: string;
  teacherId: string;
  room: string;
  day: number;
  timeStart: string;
};

type SlotTask = {
  className: string;
  day: number;
  timeStart: string;
  subject: string;
};

type Candidate = {
  teacherId: string;
  room: string;
};

function slotKey(day: number, timeStart: string) {
  return `${day}-${timeStart}`;
}

function normalizeSubjects(subjects: SubjectInput[]): Array<{ name: string; lessonsPerWeek: number }> {
  return subjects.map((subject) => {
    if (typeof subject === "string") {
      return { name: subject, lessonsPerWeek: 1 };
    }
    return {
      name: subject.name,
      lessonsPerWeek: Math.max(1, subject.lessonsPerWeek ?? 1),
    };
  });
}

function buildClassSubjectQueue(
  normalizedSubjects: Array<{ name: string; lessonsPerWeek: number }>,
  totalLessons: number
) {
  // Build weighted cycle: subjects with higher lessonsPerWeek appear more often.
  const weighted: string[] = [];
  normalizedSubjects.forEach((subject) => {
    for (let i = 0; i < subject.lessonsPerWeek; i += 1) {
      weighted.push(subject.name);
    }
  });

  if (weighted.length === 0) {
    return [];
  }

  // Expand the weighted cycle to exactly totalLessons items.
  const queue: string[] = [];
  for (let i = 0; i < totalLessons; i += 1) {
    queue.push(weighted[i % weighted.length]);
  }
  return queue;
}

export function generateSchedule(
  teachers: TeacherInput[],
  subjects: SubjectInput[],
  classes: string[],
  rooms: string[],
  timeSlots: string[],
  days: number[]
): ScheduleEntry[] {
  // Keep only first 6 lessons/day to satisfy the "max 6 lessons per day" requirement.
  const dailySlots = timeSlots.slice(0, 6);
  const normalizedSubjects = normalizeSubjects(subjects);
  const totalSlotsPerClass = days.length * dailySlots.length;

  if (!teachers.length || !classes.length || !rooms.length || !dailySlots.length || !days.length) {
    return [];
  }

  // Step 1: Build deterministic tasks for each class/day/time with preselected subjects.
  const tasks: SlotTask[] = [];
  classes.forEach((className) => {
    const subjectQueue = buildClassSubjectQueue(normalizedSubjects, totalSlotsPerClass);
    let index = 0;
    days.forEach((day) => {
      dailySlots.forEach((timeStart) => {
        tasks.push({
          className,
          day,
          timeStart,
          subject: subjectQueue[index] ?? normalizedSubjects[0]?.name ?? "Unknown",
        });
        index += 1;
      });
    });
  });

  // Step 2: Prepare mutable occupancy maps for constraint checks.
  const teacherSlots = new Set<string>();
  const roomSlots = new Set<string>();

  // Seed teacher occupancy with externally busy slots.
  teachers.forEach((teacher) => {
    teacher.busySlots.forEach((busy) => {
      teacherSlots.add(`${teacher.id}|${busy}`);
    });
  });

  // Step 3: Generate valid candidates for a task (greedy ordering).
  const getCandidates = (task: SlotTask): Candidate[] => {
    const key = slotKey(task.day, task.timeStart);
    const subjectTeachers = teachers.filter((teacher) => teacher.subjects.includes(task.subject));
    const fallbackTeachers = teachers.filter((teacher) => !subjectTeachers.some((t) => t.id === teacher.id));
    const rankedTeachers = [...subjectTeachers, ...fallbackTeachers];

    const candidates: Candidate[] = [];
    for (const teacher of rankedTeachers) {
      if (teacherSlots.has(`${teacher.id}|${key}`)) {
        continue;
      }
      for (const room of rooms) {
        if (roomSlots.has(`${room}|${key}`)) {
          continue;
        }
        candidates.push({ teacherId: teacher.id, room });
      }
    }
    return candidates;
  };

  // Step 4: Backtracking search over tasks with greedy candidate ordering.
  const result: ScheduleEntry[] = [];

  const backtrack = (index: number): boolean => {
    if (index >= tasks.length) {
      return true;
    }

    const task = tasks[index];
    const key = slotKey(task.day, task.timeStart);
    const candidates = getCandidates(task);

    for (const candidate of candidates) {
      const teacherOccupancyKey = `${candidate.teacherId}|${key}`;
      const roomOccupancyKey = `${candidate.room}|${key}`;

      // Place lesson tentatively.
      teacherSlots.add(teacherOccupancyKey);
      roomSlots.add(roomOccupancyKey);
      result.push({
        className: task.className,
        subject: task.subject,
        teacherId: candidate.teacherId,
        room: candidate.room,
        day: task.day,
        timeStart: task.timeStart,
      });

      // Continue greedily; if dead-end appears, rollback and try next candidate.
      if (backtrack(index + 1)) {
        return true;
      }

      // Backtracking rollback.
      result.pop();
      teacherSlots.delete(teacherOccupancyKey);
      roomSlots.delete(roomOccupancyKey);
    }

    return false;
  };

  const solved = backtrack(0);
  if (!solved) {
    throw new Error(
      "Unable to generate a conflict-free schedule with current constraints. Add teachers/rooms or reduce load."
    );
  }

  return result;
}
