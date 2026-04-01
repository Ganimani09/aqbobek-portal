'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

const studentsByGrade = [
  { grade: '8 классы', count: 56, color: '#3b82f6' },
  { grade: '9 классы', count: 64, color: '#6366f1' },
  { grade: '10 классы', count: 58, color: '#8b5cf6' },
  { grade: '11 классы', count: 48, color: '#a855f7' },
]

const performanceMonthly = [
  { month: 'Сен', score: 3.8 },
  { month: 'Окт', score: 3.9 },
  { month: 'Ноя', score: 4.0 },
  { month: 'Дек', score: 4.1 },
  { month: 'Янв', score: 4.0 },
  { month: 'Фев', score: 4.2 },
  { month: 'Мар', score: 4.1 },
]

const gradeDistribution = [
  { name: 'Отлично (5)', value: 38, color: '#16a34a' },
  { name: 'Хорошо (4)', value: 34, color: '#2563eb' },
  { name: 'Удовл. (3)', value: 20, color: '#ca8a04' },
  { name: 'Неуд. (2)', value: 8, color: '#dc2626' },
]

const attendanceData = [
  { month: 'Сен', percent: 96 },
  { month: 'Окт', percent: 94 },
  { month: 'Ноя', percent: 92 },
  { month: 'Дек', percent: 89 },
  { month: 'Янв', percent: 93 },
  { month: 'Фев', percent: 95 },
  { month: 'Мар', percent: 94 },
]

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Аналитика</h1>
          <p className="mt-1 text-blue-700/70">Статистика и показатели лицея Aqbobek</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Всего учеников', value: '226' },
            { label: 'Учителей', value: '42' },
            { label: 'Средний балл', value: '4.1' },
            { label: 'Посещаемость', value: '94%' },
          ].map(kpi => (
            <Card key={kpi.label} className="border-blue-100 bg-white/90">
              <CardHeader className="pb-2">
                <p className="text-sm font-medium text-blue-900/60">{kpi.label}</p>
                <CardTitle className="text-3xl text-blue-800">{kpi.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ученики по параллелям */}
          <Card className="border-blue-100 bg-white/90">
            <CardHeader><CardTitle className="text-blue-900">Ученики по параллелям</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentsByGrade}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="grade" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" name="Учеников" radius={[6, 6, 0, 0]}>
                      {studentsByGrade.map(entry => (
                        <Cell key={entry.grade} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Средний балл по месяцам */}
          <Card className="border-blue-100 bg-white/90">
            <CardHeader><CardTitle className="text-blue-900">Динамика среднего балла</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceMonthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis domain={[3, 5]} stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" name="Средний балл" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Распределение оценок */}
          <Card className="border-blue-100 bg-white/90">
            <CardHeader><CardTitle className="text-blue-900">Распределение оценок</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradeDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                      {gradeDistribution.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Посещаемость */}
          <Card className="border-blue-100 bg-white/90">
            <CardHeader><CardTitle className="text-blue-900">Посещаемость по месяцам</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis domain={[80, 100]} stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="percent" name="Посещаемость (%)" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
