'use client'

import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

const gpaData = [
  { week: 'Нед 1', gpa: 4.0 },
  { week: 'Нед 2', gpa: 4.1 },
  { week: 'Нед 3', gpa: 3.9 },
  { week: 'Нед 4', gpa: 4.2 },
  { week: 'Нед 5', gpa: 4.1 },
  { week: 'Нед 6', gpa: 4.2 },
]

const subjectGrades = [
  { subject: 'Математика', grades: [4, 5, 4, 3, 5] },
  { subject: 'Физика', grades: [3, 3, 4, 3, 2] },
  { subject: 'История', grades: [5, 5, 4, 5, 4] },
  { subject: 'Химия', grades: [4, 3, 4, 4, 3] },
  { subject: 'Биология', grades: [5, 5, 5, 4, 5] },
]

export default function StudentDashboardPage() {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAiAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student: 'Алибек Сейтов, 10А',
          gpaData,
          subjectGrades,
        }),
      })

      if (!res.ok) {
        throw new Error('Ошибка при получении анализа')
      }

      const data = await res.json()
      // Fallback strategies for different typical AI route response formats
      const resultText = data.analysis || data.message || data.result || data.text || JSON.stringify(data)
      setAiAnalysis(resultText)
    } catch (e: any) {
      setError(e.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">Дашборд ученика — Алибек Сейтов, 10А</h1>
            <p className="mt-1 font-medium text-blue-700/80">Осенний семестр</p>
          </div>
          <Button 
            onClick={handleAiAnalysis} 
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 font-medium text-white shadow-md transition-all hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI Анализ
          </Button>
        </div>

        {/* AI Result Card */}
        {(aiAnalysis || error) && (
          <Card className="border-indigo-200 bg-white/80 shadow-sm ring-1 ring-indigo-100 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Результат AI Анализа
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="font-medium text-red-600">{error}</p>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-700">
                  <p className="whitespace-pre-wrap">{aiAnalysis}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-blue-900/60">Средний балл</CardDescription>
              <CardTitle className="text-3xl text-blue-800">4.2</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-blue-900/60">Рейтинг в классе</CardDescription>
              <CardTitle className="text-3xl text-blue-800">7/28</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-blue-900/60">Пропусков</CardDescription>
              <CardTitle className="text-3xl text-blue-800">2</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-blue-900/60">Баллов</CardDescription>
              <CardTitle className="text-3xl text-blue-800">340</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Chart */}
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Динамика успеваемости</CardTitle>
              <CardDescription className="text-blue-900/60">Изменение среднего балла за последние 6 недель</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[3, 5]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      name="Средний балл"
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Оценки по предметам</CardTitle>
              <CardDescription className="text-blue-900/60">Детализация текущей успеваемости</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-left text-blue-900/60">
                      <th className="px-4 py-3 font-medium">Предмет</th>
                      <th className="px-4 py-3 font-medium">Оценки</th>
                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Средний</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectGrades.map((item, idx) => {
                      const avg = (item.grades.reduce((a, b) => a + b, 0) / item.grades.length).toFixed(1)
                      return (
                        <tr key={idx} className="border-b border-blue-50 last:border-none">
                          <td className="px-4 py-3 font-medium text-blue-950">{item.subject}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {item.grades.map((grade, gIdx) => (
                                <span 
                                  key={gIdx} 
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-medium
                                    ${grade === 5 ? 'bg-green-100 text-green-700' : 
                                      grade === 4 ? 'bg-blue-100 text-blue-700' : 
                                      'bg-amber-100 text-amber-700'}
                                  `}
                                >
                                  {grade}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-900">
                            {avg}
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
      </div>
    </main>
  )
}
