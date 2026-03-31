'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Calendar, TrendingUp, Info, Clock } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

// Mock data
const gpaData = [
  { week: 'Нед 1', gpa: 4.0 },
  { week: 'Нед 2', gpa: 4.1 },
  { week: 'Нед 3', gpa: 3.9 },
  { week: 'Нед 4', gpa: 4.2 },
  { week: 'Нед 5', gpa: 4.1 },
  { week: 'Нед 6', gpa: 4.2 },
]

const upcomingEvents = [
  { id: 1, title: 'Общешкольное родительское собрание', date: '15 Октября, 18:00', type: 'school' },
  { id: 2, title: 'Олимпиада по физике (Городской этап)', date: '21 Октября, 09:00', type: 'academic' },
  { id: 3, title: 'Спортивные соревнования (Волейбол)', date: '25 Октября, 15:30', type: 'sport' },
]

export default function ParentDashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Заголовок */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">Родитель</h1>
            <p className="mt-1 font-medium text-blue-700/80">Наблюдение за Алибеком Сейтовым, 10А</p>
          </div>
        </div>

        {/* AI Выжимка */}
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md ring-1 ring-indigo-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              AI Выжимка недели
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-white/70 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-slate-700 leading-relaxed">
                На этой неделе Алибек показал <strong>отличные результаты по математике и биологии</strong>, закрыв старые долги. 
                Однако мы зафиксировали спад успеваемости по физике (две тройки подряд) и 1 пропуск по истории. 
                <br /><br />
                <strong>💡 Рекомендация:</strong> Убедитесь, что Алибек уделит время подготовке к субботней лабораторной по физике. В целом, динамика среднего балла остаётся положительной (4.2).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Сетка графиков и мероприятий */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* График оценок */}
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Динамика среднего балла
              </CardTitle>
              <CardDescription className="text-blue-900/60">Изменение за последние 6 недель</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
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

          {/* Ближайшие мероприятия */}
          <Card className="border-blue-100 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Calendar className="h-5 w-5 text-blue-600" />
                Ближайшие мероприятия
              </CardTitle>
              <CardDescription className="text-blue-900/60">Школьные и академические события Алибека</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 rounded-lg border border-blue-50 bg-white p-4 shadow-sm transition-all hover:border-blue-100 hover:shadow-md">
                    <div 
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full 
                        ${event.type === 'academic' ? 'bg-indigo-100 text-indigo-600' : 
                          event.type === 'sport' ? 'bg-green-100 text-green-600' : 
                          'bg-amber-100 text-amber-600'}`}
                    >
                      {event.type === 'academic' ? <Info className="h-5 w-5" /> : 
                       event.type === 'sport' ? <Sparkles className="h-5 w-5" /> : 
                       <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-blue-950">{event.title}</p>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}
