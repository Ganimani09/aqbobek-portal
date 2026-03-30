import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type TopStudent = {
  name: string;
  class: string;
  points: number;
  subject: string;
};

type TodayScheduleItem = {
  class: string;
  subject: string;
  time: string;
  room: string;
  isReplacement: boolean;
};

type Announcement = {
  title: string;
  description: string;
  date: string;
  targetClass: string;
};

type RecentAchievement = {
  studentName: string;
  title: string;
  description: string;
};

type KioskDataResponse = {
  topStudents: TopStudent[];
  todaySchedule: TodayScheduleItem[];
  announcements: Announcement[];
  recentAchievements: RecentAchievement[];
};

function mapWeekdayToNumber(weekday: number) {
  // JS getDay(): 0 Sunday ... 6 Saturday
  // We need academic format: Monday=1 ... Friday=5
  if (weekday === 0) return 7;
  return weekday;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Missing Supabase env vars." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const todayAcademicDay = mapWeekdayToNumber(today.getDay());

  try {
    const [gradesRes, scheduleRes, eventsRes, achievementsRes] = await Promise.all([
      supabase
        .from("grades")
        .select("student_name, class_name, total_points, best_subject")
        .order("total_points", { ascending: false })
        .limit(3),
      supabase
        .from("schedule")
        .select("class_name, subject, time, room, is_replacement, day")
        .eq("day", todayAcademicDay)
        .order("time", { ascending: true }),
      supabase
        .from("events")
        .select("title, description, date, audience")
        .gte("date", todayIso)
        .order("date", { ascending: true })
        .limit(6),
      supabase
        .from("achievements")
        .select("student_name, title, description, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    if (gradesRes.error || scheduleRes.error || eventsRes.error || achievementsRes.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch kiosk data from Supabase.",
          details: {
            grades: gradesRes.error?.message,
            schedule: scheduleRes.error?.message,
            events: eventsRes.error?.message,
            achievements: achievementsRes.error?.message,
          },
        },
        { status: 500 }
      );
    }

    const topStudents: TopStudent[] = (gradesRes.data ?? []).map((row) => ({
      name: String(row.student_name ?? "Неизвестно"),
      class: String(row.class_name ?? "-"),
      points: Number(row.total_points ?? 0),
      subject: String(row.best_subject ?? "—"),
    }));

    const todaySchedule: TodayScheduleItem[] = (scheduleRes.data ?? []).map((row) => ({
      class: String(row.class_name ?? "-"),
      subject: String(row.subject ?? "-"),
      time: String(row.time ?? "-"),
      room: String(row.room ?? "-"),
      isReplacement: Boolean(row.is_replacement ?? false),
    }));

    const announcements: Announcement[] = (eventsRes.data ?? []).map((row) => ({
      title: String(row.title ?? "Без названия"),
      description: String(row.description ?? ""),
      date: String(row.date ?? todayIso),
      targetClass: String(row.audience ?? "all"),
    }));

    const recentAchievements: RecentAchievement[] = (achievementsRes.data ?? []).map((row) => ({
      studentName: String(row.student_name ?? "Неизвестно"),
      title: String(row.title ?? "Достижение"),
      description: String(row.description ?? ""),
    }));

    const response: KioskDataResponse = {
      topStudents,
      todaySchedule,
      announcements,
      recentAchievements,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Unexpected error while loading kiosk data.", details: message },
      { status: 500 }
    );
  }
}
