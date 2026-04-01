'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, FileText, Download, Trash2 } from 'lucide-react'

type Resource = {
  id: string
  title: string
  description: string
  url?: string
  user_id?: string
  created_at: string
}

export default function ResourcesPage() {
  const { user, userRole } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setResources([
        { id: '1', title: 'Конспект по алгебре — 10 класс', description: 'Тема: Производная. Краткий конспект с примерами решений.', created_at: '2026-03-25' },
        { id: '2', title: 'Презентация по физике — Законы Ньютона', description: 'Слайды для 10А класса. 25 страниц с иллюстрациями.', created_at: '2026-03-20' },
        { id: '3', title: 'Сборник задач по химии', description: 'Подготовка к СОЧ. 50 задач с решениями.', created_at: '2026-03-18' },
        { id: '4', title: 'Эссе — Великая Отечественная Война', description: 'Пример эссе для 11 класса. Формат ЕНТ.', created_at: '2026-03-15' },
      ])
    } else {
      setResources(data ?? [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('resources').insert({ title, description, url, user_id: user.id })
    if (err) setError(err.message)
    else { setTitle(''); setDescription(''); setUrl(''); fetchResources() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('resources').delete().eq('id', id)
    if (err) setError(err.message)
    else setResources(prev => prev.filter(r => r.id !== id))
  }

  const canCreate = userRole === 'admin' || userRole === 'staff' || userRole === 'teacher'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Ресурсы</h1>
          <p className="mt-1 text-blue-700/70">Учебные материалы и документы</p>
        </div>

        {canCreate && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><FileText className="h-5 w-5" /> Загрузить ресурс</CardTitle>
              <CardDescription>Материал сохраняется в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Конспект по алгебре" required />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Краткое описание..." rows={3} required />
                </div>
                <div className="space-y-2">
                  <Label>Ссылка на файл (необязательно)</Label>
                  <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://drive.google.com/..." />
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
          ) : resources.length === 0 ? (
            <Card className="border-blue-100 bg-white/90"><CardContent className="py-10 text-center text-slate-500">Ресурсов пока нет</CardContent></Card>
          ) : (
            resources.map(r => (
              <Card key={r.id} className="border-blue-100 bg-white/90 transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-blue-900">{r.title}</CardTitle>
                      <CardDescription>{new Date(r.created_at).toLocaleDateString('ru-RU')}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {r.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={r.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 text-blue-600" /></a>
                        </Button>
                      )}
                      {canCreate && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{r.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
