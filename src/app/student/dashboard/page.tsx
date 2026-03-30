'use client'

import { useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, BrainCircuit, Crown, Star, Trophy } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Subject =
  | 'Математика'
  | 'Физика'
  | 'Химия'
  | 'История'
  | 'Биология'
  | 'Русский язык'

type GradeItem = {
  subject: Subject
  grade: number
}

type ProgressPoint = {
  lesson: string
  grade: number
}

type Achievement = {
  title: string
  description: string
  icon: 'star' | 'award' | 'trophy'
}

type ScheduleItem = {
  time: string
  subject: string
  room: string
  teacher: string
}

type LeaderboardItem = {
  name: string
  points: number
}

type GradesApiResponse = {
  student?: {
    name?: string
    className?: string
    avatarUrl?: string
  }
  grades?: GradeItem[]
  progress?: ProgressPoint[]
  achievements?: Achievement[]
  schedule?: ScheduleItem[]
  leaderboard?: LeaderboardItem[]
}

const subjects: Subject[] = ['Математика', 'Физика', 'Химия', 'История', 'Биология', 'Русский язык']

const defaultGrades: GradeItem[] = [
  { subject: 'Математика', grade: 5 },
  { subject: 'Физика', grade: 4 },
  { subject: 'Химия', grade: 5 },
  { subject: 'История', grade: 4 },
  { subject: 'Биология', grade: 5 },
  { subject: 'Русский язык', grade: 4 },
]

const defaultProgress: ProgressPoint[] = [
  { lesson: 'Урок 1', grade: 4 },
  { lesson: 'Урок 2', grade: 5 },
  { lesson: 'Урок 3', grade: 4 },
  { lesson: 'Урок 4', grade: 5 },
  { lesson: 'Урок 5', grade: 5 },
  { lesson: 'Урок 6', grade: 4 },
  { lesson: 'Урок 7', grade: 5 },
  { lesson: 'Урок 8', grade: 5 },
  { lesson: 'Урок 9', grade: 4 },
  { lesson: 'Урок 10', grade: 5 },
]

const defaultAchievements: Achievement[] = [
  { title: 'Отличник недели', description: 'Средний балл выше 4.8', icon: 'star' },
  { title: 'Научный прорыв', description: '5 по физике и химии подряд', icon: 'award' },
  { title: 'Топ-5 класса', description: 'Стабильно высокий рейтинг', icon: 'trophy' },
]

const defaultSchedule: ScheduleItem[] = [
  { time: '08:30', subject: 'Математика', room: '203', teacher: 'А. Ибрагимов' },
  { time: '09:25', subject: 'Физика', room: '105', teacher: 'Н. Рахимова' },
  { time: '10:20', subject: 'История', room: '304', teacher: 'Д. Юсупов' },
  { time: '11:15', subject: 'Биология', room: '210', teacher: 'М. Каримова' },
]

const defaultLeaderboard: LeaderboardItem[] = [
  { name: 'Азамат И.', points: 492 },
  { name: 'София К.', points: 486 },
  { name: 'Нурали Т.', points: 481 },
  { name: 'Малика Ш.', points: 478 },
  { name: 'Давид Б.', points: 471 },
]

function getGradeBadgeClass(grade: number) {
  if (grade >= 5) return 'bg-emerald-500 text-white'
  if (grade === 4) return 'bg-blue-500 text-white'
  if (grade === 3) return 'bg-yellow-500 text-white'
  return 'bg-red-500 text-white'
}

function getAchievementIcon(icon: Achievement['icon']) {
  if (icon === 'award') return Award
  if (icon === 'trophy') return Trophy
  return Star
}

export default function StudentDashboardPage() {
  const [studentName, setStudentName] = useState('Ученик')
  const [className, setClassName] = useState('10-А класс')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [grades, setGrades] = useState<GradeItem[]>(defaultGrades)
  const [progressData, setProgressData] = useState<ProgressPoint[]>(defaultProgress)
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule)
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(defaultLeaderboard)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/grades', { cache: 'no-store' })

        if (response.ok) {
          const data = (await response.json()) as GradesApiResponse
          if (!active) return

          setStudentName(data.student?.name || 'Ученик')
          setClassName(data.student?.className || '10-А класс')
          setAvatarUrl(data.student?.avatarUrl || '')
          setGrades(data.grades?.length ? data.grades : defaultGrades)
          setProgressData(data.progress?.length ? data.progress.slice(-10) : defaultProgress)
          setAchievements(data.achievements?.length ? data.achievements : defaultAchievements)
          setSchedule(data.schedule?.length ? data.schedule : defaultSchedule)
          setLeaderboard(data.leaderboard?.length ? data.leaderboard.slice(0, 5) : defaultLeaderboard)
        } else {
          if (!active) return
          setError('Не удалось загрузить данные из API. Показаны демо-данные.')
        }
      } catch {
        if (!active) return
        setError('Сервер временно недоступен. Показаны демо-данные.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [])

  const normalizedGrades = useMemo(() => {
    return subjects.map((subject) => grades.find((item) => item.subject === subject) ?? { subject, grade: 2 })
  }, [grades])

  const averageGrade = useMemo(() => {
    const sum = normalizedGrades.reduce((acc, item) => acc + item.grade, 0)
    return (sum / normalizedGrades.length).toFixed(2)
  }, [normalizedGrades])

  const handleAiAnalyze = async () => {
    setAiLoading(true)
    setAiResult('')

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: normalizedGrades,
          progress: progressData,
        }),
      })

      if (!response.ok) {
        throw new Error('AI API request failed')
      }

      const data = (await response.json()) as { result?: string; analysis?: string; message?: string }
      setAiResult(
        data.result ||
          data.analysis ||
          data.message ||
          'AI анализ завершен. Продолжайте в том же духе и уделите внимание слабым предметам.'
      )
    } catch {
      setAiResult(
        'AI-сервис пока недоступен. Рекомендация: повторите темы по предметам с оценками 3 и ниже, и решайте 15-20 задач в день по математике.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border-blue-200 bg-white/90 shadow-lg">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Привет, {studentName}!</h1>
              <p className="mt-1 text-sm text-slate-600">{className}</p>
            </div>
            <Avatar className="h-14 w-14 border-2 border-blue-200">
              <AvatarImage src={avatarUrl} alt={studentName} />
              <AvatarFallback className="bg-blue-600 text-white">
                {studentName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 text-sm text-yellow-800">{error}</CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {normalizedGrades.map((item) => (
            <Card key={item.subject} className="border-slate-200">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">{item.subject}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">Оценка</p>
                </div>
                <span className={`rounded-lg px-4 py-2 text-xl font-bold ${getGradeBadgeClass(item.grade)}`}>
                  {item.grade}
                </span>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>График успеваемости</CardTitle>
              <CardDescription>Динамика за последние 10 уроков</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <XAxis dataKey="lesson" />
                    <YAxis domain={[2, 5]} ticks={[2, 3, 4, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="grade" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-blue-600" />
                AI-Тьютор
              </CardTitle>
              <CardDescription>Персональные рекомендации по учебе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={handleAiAnalyze} disabled={aiLoading}>
                {aiLoading ? 'Анализируем...' : 'Проанализировать успеваемость'}
              </Button>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                {aiResult || 'Нажмите кнопку, чтобы получить AI-анализ вашей успеваемости.'}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Достижения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((item) => {
                const Icon = getAchievementIcon(item.icon)
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Расписание на сегодня
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-600">
                      <th className="px-2 py-2 font-medium">Время</th>
                      <th className="px-2 py-2 font-medium">Предмет</th>
                      <th className="px-2 py-2 font-medium">Кабинет</th>
                      <th className="px-2 py-2 font-medium">Учитель</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item) => (
                      <tr key={`${item.time}-${item.subject}`} className="border-b last:border-none">
                        <td className="px-2 py-2 text-slate-700">{item.time}</td>
                        <td className="px-2 py-2 font-medium text-slate-900">{item.subject}</td>
                        <td className="px-2 py-2 text-slate-700">{item.room}</td>
                        <td className="px-2 py-2 text-slate-700">{item.teacher}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Лидерборд класса (Топ-5)
            </CardTitle>
            <CardDescription>Ваш средний балл: {averageGrade}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                    {index + 1}
                  </div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                </div>
                <p className="font-semibold text-blue-700">{item.points} баллов</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="fixed bottom-4 right-4 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
          Обновляем данные...
        </div>
      ) : null}
    </main>
  )
}
