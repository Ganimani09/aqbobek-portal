'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FileText, ShieldAlert, ShieldCheck, Shield } from 'lucide-react'

type Student = {
  id: string
  name: string
  grades: number[]
}

const studentsData: Student[] = [
  { id: '1', name: 'Алибек Сейтов', grades: [4, 5, 4, 3, 5] },
  { id: '2', name: 'Дильназ Муратова', grades: [5, 5, 5, 5, 4] },
  { id: '3', name: 'Ерасыл Нурланов', grades: [3, 3, 2, 3, 3] },
  { id: '4', name: 'Аружан Сапарова', grades: [4, 4, 3, 4, 4] },
  { id: '5', name: 'Максат Ким', grades: [5, 4, 5, 4, 5] },
  { id: '6', name: 'Зарина Омарова', grades: [2, 3, 3, 2, 3] },
  { id: '7', name: 'Нуржан Каримов', grades: [3, 4, 3, 4, 3] },
  { id: '8', name: 'Айдана Искакова', grades: [5, 5, 5, 5, 5] },
  { id: '9', name: 'Тимур Ахметов', grades: [4, 3, 4, 3, 4] },
  { id: '10', name: 'Дария Оспанова', grades: [3, 4, 4, 5, 4] },
]

export default function TeacherDashboardPage() {
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher: 'Айгуль',
          subject: 'Математика',
          students: studentsData,
        }),
      })

      if (!res.ok) {
        throw new Error('Ошибка генерации отчёта')
      }

      const data = await res.json()
      // Fallbacks in case the API shape varies
      const text = data.report || data.message || data.result || data.text || JSON.stringify(data)
      setAiReport(text)
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Заголовок страницы */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">Учитель Айгуль — Математика</h1>
            <p className="mt-1 font-medium text-blue-700/80">Панель управления классом</p>
          </div>
          <Button
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 font-medium text-white shadow-md transition-all hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Сгенерировать отчёт класса
          </Button>
        </div>

        {/* Результат AI отчёта */}
        {(aiReport || error) && (
          <Card className="border-indigo-200 bg-white/80 shadow-sm ring-1 ring-indigo-100 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
                <FileText className="h-5 w-5 text-indigo-600" />
                Отчёт класса от AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="font-medium text-red-600">{error}</p>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-700">
                  <p className="whitespace-pre-wrap">{aiReport}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Таблица учеников (основной контент) */}
        <Card className="border-blue-100 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Успеваемость: 10А класс</CardTitle>
            <CardDescription className="text-blue-900/60">
              Цветовые индикаторы: Зелёный (отлично/хорошо), Жёлтый (в зоне риска &lt; 4), Красный (критически низкий &lt; 3.5)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-100 text-left text-blue-900/60">
                    <th className="px-4 py-3 font-medium">Ученик</th>
                    <th className="px-4 py-3 font-medium">Оценки</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Ср. балл</th>
                    <th className="whitespace-nowrap px-4 py-3 text-center font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => {
                    const avgStr = (student.grades.reduce((a, b) => a + b, 0) / student.grades.length).toFixed(1)
                    const avg = parseFloat(avgStr)

                    // Логика цвета индикатора
                    const isCritical = avg < 3.5
                    const isWarning = avg >= 3.5 && avg < 4
                    const isGood = avg >= 4

                    return (
                      <tr key={student.id} className="border-b border-blue-50 last:border-none">
                        <td className="px-4 py-4 font-medium text-blue-950">{student.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {student.grades.map((grade, gIdx) => (
                              <span
                                key={gIdx}
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-medium
                                  ${grade === 5 ? 'bg-green-100 text-green-700' :
                                    grade === 4 ? 'bg-blue-100 text-blue-700' :
                                      grade === 3 ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                  }
                                `}
                              >
                                {grade}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-blue-900">
                          {avgStr}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            {isCritical && (
                              <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span>Риск</span>
                              </div>
                            )}
                            {isWarning && (
                              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                                <Shield className="h-3.5 w-3.5" />
                                <span>Внимание</span>
                              </div>
                            )}
                            {isGood && (
                              <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Норма</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
