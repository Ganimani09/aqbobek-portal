'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Calendar, Trash2 } from 'lucide-react'

type EventItem = {
  id: string
  title: string
  description: string
  date: string
  audience?: string
  created_at?: string
}

export default function EventsPage() {
  const { user, userRole } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [audience, setAudience] = useState('all')

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    if (err) setError('Не удалось загрузить мероприятия')
    else setEvents(data ?? [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('events')
      .insert({ title, description, date, audience })

    if (err) setError(err.message)
    else { setTitle(''); setDescription(''); setDate(''); setAudience('all'); fetchEvents() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('events').delete().eq('id', id)
    if (err) setError(err.message)
    else setEvents(prev => prev.filter(ev => ev.id !== id))
  }

  const canCreate = userRole === 'admin' || userRole === 'staff' || userRole === 'principal' || userRole === 'teacher'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Мероприятия</h1>
          <p className="mt-1 text-blue-700/70">Школьные события и мероприятия</p>
        </div>

        {canCreate && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><Calendar className="h-5 w-5" /> Создать мероприятие</CardTitle>
              <CardDescription>Данные сохраняются в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Название</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Родительское собрание" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание мероприятия..." rows={3} />
                </div>
                <div className="space-y-2 w-48">
                  <Label>Аудитория</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="10А">10А</SelectItem>
                      <SelectItem value="10Б">10Б</SelectItem>
                      <SelectItem value="11А">11А</SelectItem>
                      <SelectItem value="teachers">Учителя</SelectItem>
                      <SelectItem value="parents">Родители</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Создать'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : events.length === 0 ? (
            <div className="col-span-full"><Card className="border-blue-100 bg-white/90"><CardContent className="py-10 text-center text-slate-500">Мероприятий пока нет</CardContent></Card></div>
          ) : (
            events.map(ev => (
              <Card key={ev.id} className="border-blue-100 bg-white/90 transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-blue-900">{ev.title}</CardTitle>
                    {canCreate && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(ev.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {new Date(ev.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {ev.audience && ev.audience !== 'all' && ` • ${ev.audience}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{ev.description || 'Без описания'}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
