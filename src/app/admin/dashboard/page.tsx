'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type AdminSection = 'overview' | 'schedule' | 'events' | 'notifications'

type EventItem = {
  id: string
  title: string
  description: string
  date: string
  audience: string
  created_at?: string
}

const navItems: Array<{ key: AdminSection; label: string }> = [
  { key: 'overview', label: 'Обзор' },
  { key: 'schedule', label: 'Расписание' },
  { key: 'events', label: 'Мероприятия' },
  { key: 'notifications', label: 'Уведомления' },
]

const kpis = [
  { title: 'Всего учеников', value: '284' },
  { title: 'Учителей', value: '42' },
  { title: 'Средний балл', value: '4.1' },
  { title: 'Посещаемость', value: '94%' },
]

const performanceByGrade = [
  { grade: '8 классы', score: 3.8 },
  { grade: '9 классы', score: 4.0 },
  { grade: '10 классы', score: 4.2 },
  { grade: '11 классы', score: 4.1 },
]

const marksDistribution = [
  { name: '5', value: 38, color: '#16a34a' },
  { name: '4', value: 34, color: '#2563eb' },
  { name: '3', value: 20, color: '#ca8a04' },
  { name: '2', value: 8, color: '#dc2626' },
]

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [events, setEvents] = useState<EventItem[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [audience, setAudience] = useState('all')

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    return createClient(url, key)
  }, [])

  useEffect(() => {
    let active = true

    const fetchEvents = async () => {
      if (!supabase) {
        setLoadingEvents(false)
        return
      }

      setLoadingEvents(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('id, title, description, date, audience, created_at')
          .order('date', { ascending: true })

        if (fetchError) throw fetchError
        if (active) setEvents((data as EventItem[]) ?? [])
      } catch {
        if (active) setError('Не удалось загрузить мероприятия из Supabase.')
      } finally {
        if (active) setLoadingEvents(false)
      }
    }

    void fetchEvents()
    return () => {
      active = false
    }
  }, [supabase])

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!supabase) {
      setError('Не настроены переменные Supabase.')
      return
    }

    setSaving(true)
    try {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          title,
          description,
          date,
          audience,
        })
        .select('id, title, description, date, audience, created_at')
        .single()

      if (insertError) throw insertError
      setEvents((prev) => [...prev, data as EventItem].sort((a, b) => a.date.localeCompare(b.date)))
      setTitle('')
      setDescription('')
      setDate('')
      setAudience('all')
    } catch {
      setError('Не удалось создать мероприятие.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    setError('')

    if (!supabase) {
      setError('Не настроены переменные Supabase.')
      return
    }

    try {
      const { error: deleteError } = await supabase.from('events').delete().eq('id', id)
      if (deleteError) throw deleteError
      setEvents((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setError('Не удалось удалить мероприятие.')
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription>{kpi.title}</CardDescription>
              <CardTitle className="text-3xl text-blue-800">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Успеваемость по параллелям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceByGrade}>
                  <XAxis dataKey="grade" />
                  <YAxis domain={[3, 5]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Распределение оценок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={marksDistribution} dataKey="value" nameKey="name" outerRadius={105} label>
                    {marksDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Последние события</CardTitle>
          <CardDescription>Живые данные из таблицы events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600">
                  <th className="px-2 py-2">Дата</th>
                  <th className="px-2 py-2">Заголовок</th>
                  <th className="px-2 py-2">Описание</th>
                  <th className="px-2 py-2">Аудитория</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 8).map((item) => (
                  <tr key={item.id} className="border-b last:border-none">
                    <td className="px-2 py-2">{new Date(item.date).toLocaleDateString('ru-RU')}</td>
                    <td className="px-2 py-2 font-medium text-slate-900">{item.title}</td>
                    <td className="px-2 py-2 text-slate-700">{item.description || '-'}</td>
                    <td className="px-2 py-2">{item.audience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!events.length && !loadingEvents ? (
              <p className="py-4 text-sm text-slate-500">Событий пока нет.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderEvents = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Создать мероприятие</CardTitle>
          <CardDescription>Событие сразу сохраняется в Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Заголовок</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, Родительское собрание"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Описание</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание мероприятия"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date">Дата</Label>
              <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Кому показывать</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите аудиторию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">all</SelectItem>
                  <SelectItem value="10А">10А</SelectItem>
                  <SelectItem value="10Б">10Б</SelectItem>
                  <SelectItem value="11А">11А</SelectItem>
                  <SelectItem value="teachers">teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={saving}>
              {saving ? 'Сохраняем...' : 'Создать событие'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Существующие события</CardTitle>
          <CardDescription>Можно удалить любое мероприятие</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description || 'Без описания'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(item.date).toLocaleDateString('ru-RU')} • {item.audience}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEvent(item.id)}
                  className="shrink-0"
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
          {!events.length && !loadingEvents ? <p className="text-sm text-slate-500">Событий пока нет.</p> : null}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">Aqbobek Lyceum Admin</CardTitle>
            <CardDescription>Панель управления лицеем</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveSection(item.key)}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => window.open('/kiosk', '_blank', 'noopener,noreferrer')}
            >
              Режим стенгазеты
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {activeSection === 'overview' ? renderOverview() : null}
          {activeSection === 'events' ? renderEvents() : null}

          {activeSection === 'schedule' ? (
            <Card>
              <CardHeader>
                <CardTitle>Расписание</CardTitle>
                <CardDescription>Раздел готов к подключению учебного расписания</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Здесь можно подключить таблицу расписания из Supabase и управление заменами.
              </CardContent>
            </Card>
          ) : null}

          {activeSection === 'notifications' ? (
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>Раздел для push и email рассылок</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Здесь можно добавить создание объявлений и массовую отправку уведомлений родителям и ученикам.
              </CardContent>
            </Card>
          ) : null}

          {error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  )
}
