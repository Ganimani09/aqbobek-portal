'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type SubjectGrade = {
  subject: string
  grades: number[]
  average: number
  trend: 'up' | 'down' | 'stable'
}

type StudentGradesResponse = {
  student: string
  class: string
  grades: SubjectGrade[]
  totalPoints: number
  rank: number
  totalStudents: number
}

type EventRow = {
  id: string | number
  title: string
  date: string
  location?: string | null
}

type ChartPoint = {
  lesson: string
  grade: number
}

const fallbackEvents: EventRow[] = [
  { id: 1, title: 'Родительское собрание 10А', date: '2026-04-05', location: 'Актовый зал' },
  { id: 2, title: 'Олимпиада по математике', date: '2026-04-09', location: 'Кабинет 203' },
  { id: 3, title: 'День открытых дверей', date: '2026-04-12', location: 'Главный корпус' },
]

function flattenForMonthlyChart(subjects: SubjectGrade[]): ChartPoint[] {
  const timeline = subjects.flatMap((subject) =>
    subject.grades.map((grade, index) => ({
      lesson: `${subject.subject.slice(0, 3)}-${index + 1}`,
      grade,
    }))
  )

  return timeline.slice(-12)
}

export default function ParentDashboardPage() {
  const [studentData, setStudentData] = useState<StudentGradesResponse | null>(null)
  const [events, setEvents] = useState<EventRow[]>(fallbackEvents)
  const [loading, setLoading] = useState(true)
  const [teacherEmail, setTeacherEmail] = useState('class.teacher@aqbobek.uz')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadDashboardData = async () => {
      setLoading(true)
      setError('')

      try {
        const gradesResponse = await fetch('/api/grades?studentId=st-001', { cache: 'no-store' })

        if (gradesResponse.ok) {
          const gradesJson = (await gradesResponse.json()) as StudentGradesResponse
          if (active) setStudentData(gradesJson)
        } else if (active) {
          setError('Не удалось загрузить оценки. Отображаются данные по умолчанию.')
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)

          const { data: eventsData } = await supabase
            .from('events')
            .select('id, title, date, location')
            .order('date', { ascending: true })
            .limit(5)

          if (active && Array.isArray(eventsData) && eventsData.length > 0) {
            setEvents(eventsData as EventRow[])
          }

          const { data: teacherData } = await supabase
            .from('teachers')
            .select('email')
            .eq('class_name', '10А')
            .maybeSingle()

          if (active && teacherData?.email) {
            setTeacherEmail(String(teacherData.email))
          }
        }
      } catch {
        if (active) {
          setError('Сервис временно недоступен. Используются резервные данные.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboardData()

    return () => {
      active = false
    }
  }, [])

  const childName = studentData?.student ?? 'Алибек Сейтов'
  const childClass = studentData?.class ?? '10А'
  const childRank = studentData ? `${studentData.rank} из ${studentData.totalStudents}` : '7 из 28'
  const monthlyChartData = useMemo(
    () => flattenForMonthlyChart(studentData?.grades ?? []),
    [studentData?.grades]
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="border-blue-200 bg-white/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Успеваемость вашего ребёнка</CardTitle>
            <CardDescription>Еженедельный срез прогресса и школьной активности</CardDescription>
          </CardHeader>
        </Card>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Профиль ученика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-blue-200">
                  <AvatarImage src="" alt={childName} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {childName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{childName}</p>
                  <p className="text-sm text-slate-600">Класс: {childClass}</p>
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                Рейтинг в классе: <span className="font-semibold">{childRank}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-emerald-200 bg-emerald-50/70">
            <CardHeader>
              <CardTitle>AI-выжимка недели</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-800">
              ✅ {childName} отлично справился с математикой (5, 5). ⚠️ Обратите внимание на физику — три тройки
              подряд. 💡 Рекомендация: обсудите подготовку к СОЧ и выделите 2 дня в неделю на разбор задач.
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>График оценок за месяц</CardTitle>
              <CardDescription>Последние 12 оценок по основным предметам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
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
              <CardTitle>Связь с учителем</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-700 hover:bg-blue-800"
                onClick={() => window.alert(`Email учителя: ${teacherEmail}`)}
              >
                Написать учителю
              </Button>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Ближайшие мероприятия школы</CardTitle>
            <CardDescription>Данные из таблицы events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={String(event.id)} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Date(event.date).toLocaleDateString('ru-RU')}
                    {event.location ? ` • ${event.location}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 text-sm text-yellow-800">{error}</CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="fixed bottom-4 right-4 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
            Загружаем данные...
          </div>
        ) : null}
      </div>
    </main>
  )
}
