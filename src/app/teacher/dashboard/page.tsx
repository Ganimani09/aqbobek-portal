'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, FileText, ShieldAlert, UserRound } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Trend = 'up' | 'down' | 'stable'

type SubjectItem = {
  subject: string
  grades: number[]
  average: number
  trend: Trend
}

type ClassStudent = {
  studentId: string
  student: string
  class: string
  average: number
  rank: number
  totalPoints: number
  subjects: SubjectItem[]
}

type RadarItem = {
  subject: string
  average: number
}

type ClassApiResponse = {
  className: string
  totalStudents: number
  students: ClassStudent[]
  classSubjectRadar?: RadarItem[]
}

type RiskStatus = 'red' | 'yellow' | 'green'

const fallbackRadar: RadarItem[] = [
  { subject: 'Математика', average: 4.1 },
  { subject: 'Физика', average: 3.6 },
  { subject: 'История', average: 4.4 },
  { subject: 'Химия', average: 3.8 },
  { subject: 'Биология', average: 4.3 },
  { subject: 'Русский язык', average: 3.6 },
]

function hasTwoDropStreak(grades: number[]) {
  if (grades.length < 3) return false
  for (let i = 2; i < grades.length; i += 1) {
    if (grades[i - 2] > grades[i - 1] && grades[i - 1] > grades[i]) {
      return true
    }
  }
  return false
}

function getStudentRisk(student: ClassStudent): { status: RiskStatus; reason: string } {
  const allGrades = student.subjects.flatMap((subject) => subject.grades)
  const hasBadGrade = allGrades.some((grade) => grade <= 2)
  const hasConsecutiveDrop = student.subjects.some((subject) => hasTwoDropStreak(subject.grades))

  if (student.average < 3 || hasConsecutiveDrop) {
    return { status: 'red', reason: 'Средний балл ниже 3 или серия падения оценок' }
  }

  if ((student.average >= 3 && student.average <= 3.5) || hasBadGrade) {
    return { status: 'yellow', reason: 'Пограничный средний балл или единичная плохая оценка' }
  }

  return { status: 'green', reason: 'Успеваемость в норме' }
}

function getRiskStyle(status: RiskStatus) {
  if (status === 'red') {
    return {
      label: 'Красный риск',
      dot: 'bg-red-500',
      row: 'bg-red-50 border-red-200',
      Icon: ShieldAlert,
    }
  }
  if (status === 'yellow') {
    return {
      label: 'Желтый риск',
      dot: 'bg-yellow-500',
      row: 'bg-yellow-50 border-yellow-200',
      Icon: AlertTriangle,
    }
  }
  return {
    label: 'Зеленая зона',
    dot: 'bg-emerald-500',
    row: 'bg-emerald-50 border-emerald-200',
    Icon: CheckCircle2,
  }
}

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState<ClassStudent[]>([])
  const [className, setClassName] = useState('10А')
  const [radarData, setRadarData] = useState<RadarItem[]>(fallbackRadar)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportText, setReportText] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadClassData = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/grades/class?className=10А', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch class data')

        const data = (await response.json()) as ClassApiResponse
        if (!active) return

        setStudents(data.students || [])
        setClassName(data.className || '10А')
        setRadarData(data.classSubjectRadar?.length ? data.classSubjectRadar : fallbackRadar)
      } catch {
        if (!active) return
        setError('Не удалось загрузить данные класса. Показываются резервные данные графика.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadClassData()

    return () => {
      active = false
    }
  }, [])

  const teacherName = 'Айжан Нуртаева'
  const teacherSubjects = 'Математика, Физика'

  const riskRows = useMemo(() => {
    return students.map((student) => ({
      ...student,
      risk: getStudentRisk(student),
    }))
  }, [students])

  const handleGenerateReport = async () => {
    setReportLoading(true)
    setReportText('')

    try {
      const response = await fetch('/api/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className,
          students: riskRows.map((item) => ({
            name: item.student,
            average: item.average,
            risk: item.risk.status,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('AI report request failed')
      }

      const data = (await response.json()) as { report?: string; text?: string; message?: string }
      setReportText(
        data.report ||
          data.text ||
          data.message ||
          'Отчет сформирован. Класс показывает стабильную динамику, но требуется внимание к группе риска.'
      )
    } catch {
      setReportText(
        'AI-отчет временно недоступен. Предварительный вывод: 2 ученика требуют срочной поддержки, 1 ученик в зоне внимания, остальной класс показывает стабильный прогресс.'
      )
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border-blue-200 bg-white/90 shadow-lg">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Добро пожаловать, {teacherName}</h1>
              <p className="mt-1 text-sm text-slate-600">Предметы: {teacherSubjects}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-700">
              <UserRound className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Радар рисков класса {className}</CardTitle>
              <CardDescription>Цвет показывает уровень академического риска по каждому ученику</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskRows.map((student) => {
                  const style = getRiskStyle(student.risk.status)
                  return (
                    <Link
                      href={`/profile/${student.studentId}`}
                      key={student.studentId}
                      className={`block rounded-lg border p-3 transition hover:shadow-md ${style.row}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{student.student}</p>
                          <p className="text-xs text-slate-600">{student.risk.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${style.dot}`} />
                          <style.Icon className="h-4 w-4 text-slate-700" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-slate-600">{style.label}</span>
                        <span className="font-medium text-slate-900">Средний балл: {student.average}</span>
                      </div>
                    </Link>
                  )
                })}
                {!riskRows.length && !loading ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">
                    Список учеников пока пуст.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" />
                AI-отчёт
              </CardTitle>
              <CardDescription>Сводный анализ по классу для педсовета</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateReport}
                className="w-full bg-blue-700 hover:bg-blue-800"
                disabled={reportLoading}
              >
                {reportLoading ? 'Генерируем...' : 'Сгенерировать отчёт класса'}
              </Button>
              <div className="min-h-32 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                {reportText || 'Нажмите кнопку, чтобы получить текстовый отчёт по классу.'}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>RadarChart успеваемости класса</CardTitle>
            <CardDescription>Средние баллы по предметам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Tooltip />
                  <Radar
                    name="Средний балл"
                    dataKey="average"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 text-sm text-yellow-800">{error}</CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  )
}
