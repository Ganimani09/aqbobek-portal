'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type TopStudent = {
  name: string
  points: number
}

type ScheduleRow = {
  time: string
  className: string
  subject: string
  teacher: string
  isReplacement?: boolean
}

type Announcement = {
  title: string
  date: string
  description: string
}

type Achievement = {
  studentName: string
  title: string
  detail: string
}

type KioskDataResponse = {
  topWeek?: TopStudent[]
  scheduleToday?: ScheduleRow[]
  announcements?: Announcement[]
  achievements?: Achievement[]
}

const fallbackData: Required<KioskDataResponse> = {
  topWeek: [
    { name: 'Малика Умарова', points: 392 },
    { name: 'Сабина Рахматова', points: 386 },
    { name: 'Алибек Сейтов', points: 340 },
  ],
  scheduleToday: [
    { time: '08:00', className: '10А', subject: 'Математика', teacher: 'А. Нуртаева' },
    { time: '09:00', className: '10Б', subject: 'Физика', teacher: 'Р. Ким', isReplacement: true },
    { time: '10:00', className: '11А', subject: 'Химия', teacher: 'М. Турсунова' },
    { time: '11:00', className: '10А', subject: 'История', teacher: 'Д. Юсупов' },
    { time: '12:00', className: '10Б', subject: 'Биология', teacher: 'З. Иманова' },
  ],
  announcements: [
    {
      title: 'Родительское собрание 10-х классов',
      date: '2026-04-05',
      description: 'Обсуждение итогов четверти и подготовка к СОЧ/СОР.',
    },
    {
      title: 'Научная ярмарка Aqbobek',
      date: '2026-04-10',
      description: 'Презентация лучших STEM-проектов учащихся лицея.',
    },
    {
      title: 'Олимпиада по математике',
      date: '2026-04-14',
      description: 'Отборочный тур среди 9-11 классов.',
    },
  ],
  achievements: [
    { studentName: 'Азамат И.', title: '1 место по физике', detail: 'Городская олимпиада 2026' },
    { studentName: 'София К.', title: 'Золотой сертификат', detail: 'IELTS Mock Exam' },
    { studentName: 'Нурали Т.', title: 'Лучший проект', detail: 'Science Fair Aqbobek' },
  ],
}

const sectionTitles = ['ТОП НЕДЕЛИ', 'РАСПИСАНИЕ СЕГОДНЯ', 'АНОНСЫ', 'ДОСТИЖЕНИЯ'] as const

export default function KioskPage() {
  const [sectionIndex, setSectionIndex] = useState(0)
  const [data, setData] = useState<Required<KioskDataResponse>>(fallbackData)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch('/api/kiosk-data', { cache: 'no-store' })
        if (!response.ok) return
        const payload = (await response.json()) as KioskDataResponse

        if (!active) return
        setData({
          topWeek: payload.topWeek?.length ? payload.topWeek : fallbackData.topWeek,
          scheduleToday: payload.scheduleToday?.length ? payload.scheduleToday : fallbackData.scheduleToday,
          announcements: payload.announcements?.length ? payload.announcements : fallbackData.announcements,
          achievements: payload.achievements?.length ? payload.achievements : fallbackData.achievements,
        })
      } catch {
        // Keep fallback data for kiosk resilience.
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSectionIndex((prev) => (prev + 1) % sectionTitles.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentTitle = sectionTitles[sectionIndex]

  const content = useMemo(() => {
    if (currentTitle === 'ТОП НЕДЕЛИ') {
      return (
        <div className="grid gap-8 md:grid-cols-3">
          {data.topWeek.map((student, idx) => (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md"
            >
              <div className="mb-4 flex justify-center">
                <Avatar className="h-24 w-24 ring-4 ring-white/30">
                  <AvatarFallback className="bg-blue-600 text-2xl text-white">
                    {student.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-center text-3xl font-semibold text-white">{student.name}</p>
              <p className="mt-2 text-center text-5xl font-bold text-cyan-300">{student.points}</p>
              <p className="mt-1 text-center text-xl text-blue-100">баллов</p>
            </motion.div>
          ))}
        </div>
      )
    }

    if (currentTitle === 'РАСПИСАНИЕ СЕГОДНЯ') {
      return (
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md">
          <table className="w-full">
            <thead>
              <tr className="text-left text-2xl text-cyan-200">
                <th className="px-6 py-4">Время</th>
                <th className="px-6 py-4">Класс</th>
                <th className="px-6 py-4">Предмет</th>
                <th className="px-6 py-4">Учитель</th>
              </tr>
            </thead>
            <tbody>
              {data.scheduleToday.map((row) => (
                <tr key={`${row.time}-${row.className}-${row.subject}`} className="border-t border-white/10 text-xl text-white">
                  <td className="px-6 py-4">{row.time}</td>
                  <td className="px-6 py-4">{row.className}</td>
                  <td className={`px-6 py-4 font-semibold ${row.isReplacement ? 'text-red-400' : 'text-white'}`}>
                    {row.subject}
                  </td>
                  <td className={`${row.isReplacement ? 'text-red-300' : 'text-blue-100'} px-6 py-4`}>{row.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (currentTitle === 'АНОНСЫ') {
      return (
        <div className="grid gap-8 md:grid-cols-3">
          {data.announcements.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-blue-600/40 to-cyan-500/30 p-8 shadow-2xl"
            >
              <p className="text-xl text-cyan-200">{new Date(item.date).toLocaleDateString('ru-RU')}</p>
              <h3 className="mt-2 text-4xl font-bold text-white">{item.title}</h3>
              <p className="mt-4 text-xl leading-relaxed text-blue-100">{item.description}</p>
            </motion.div>
          ))}
        </div>
      )
    }

    return (
      <div className="grid gap-8 md:grid-cols-3">
        {data.achievements.map((item, idx) => (
          <motion.div
            key={`${item.studentName}-${item.title}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.14 }}
            className="rounded-3xl border border-emerald-200/20 bg-emerald-500/10 p-8"
          >
            <p className="text-2xl text-emerald-200">{item.studentName}</p>
            <h3 className="mt-3 text-4xl font-bold text-white">{item.title}</h3>
            <p className="mt-2 text-xl text-emerald-100">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    )
  }, [currentTitle, data])

  return (
    <main className="pointer-events-none h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-10 py-8">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col">
        <header className="mb-8 flex items-end justify-between">
          <h1 className="text-6xl font-extrabold tracking-tight text-white">Aqbobek Lyceum</h1>
          <p className="text-4xl text-cyan-200">Интерактивная стенгазета</p>
        </header>

        <AnimatePresence mode="wait">
          <motion.section
            key={currentTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-1 flex-col"
          >
            <h2 className="mb-10 text-6xl font-bold text-cyan-300">{currentTitle}</h2>
            <div className="flex-1">{content}</div>
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  )
}
