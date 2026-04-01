'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Bell, Trash2 } from 'lucide-react'

type Announcement = {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
}

export default function AnnouncementsPage() {
  const { user, userRole } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError('Не удалось загрузить объявления')
    else setAnnouncements(data ?? [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('announcements')
      .insert({ title, content, user_id: user.id })

    if (err) setError(err.message)
    else { setTitle(''); setContent(''); fetchAnnouncements() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('announcements').delete().eq('id', id)
    if (err) setError(err.message)
    else setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const canCreate = userRole === 'admin' || userRole === 'staff' || userRole === 'principal' || userRole === 'teacher'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Объявления</h1>
          <p className="mt-1 text-blue-700/70">Информация для учеников, родителей и учителей</p>
        </div>

        {canCreate && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><Bell className="h-5 w-5" /> Создать объявление</CardTitle>
              <CardDescription>Объявление будет видно всем пользователям</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Заголовок</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Родительское собрание" required />
                </div>
                <div className="space-y-2">
                  <Label>Содержание</Label>
                  <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Текст объявления..." rows={4} required />
                </div>
                <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Опубликовать'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : announcements.length === 0 ? (
            <Card className="border-blue-100 bg-white/90"><CardContent className="py-10 text-center text-slate-500">Объявлений пока нет</CardContent></Card>
          ) : (
            announcements.map(a => (
              <Card key={a.id} className="border-blue-100 bg-white/90">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-blue-900">{a.title}</CardTitle>
                      <CardDescription>{new Date(a.created_at).toLocaleString('ru-RU')}</CardDescription>
                    </div>
                    {canCreate && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{a.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
