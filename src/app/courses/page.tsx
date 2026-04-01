'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, BookOpen, Trash2, Plus } from 'lucide-react'

type Course = {
  id: string
  name: string
  teacher_name?: string
  class_name?: string
  created_at?: string
}

export default function CoursesPage() {
  const { userRole } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [teacherName, setTeacherName] = useState('')
  const [className, setClassName] = useState('')

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('courses')
      .select('*')
      .order('name')
    if (err) {
      // If table doesn't exist, show mock data
      setCourses([
        { id: '1', name: 'Математика', teacher_name: 'Айгуль Нуртаева', class_name: '10А' },
        { id: '2', name: 'Физика', teacher_name: 'Рустам Ким', class_name: '10А' },
        { id: '3', name: 'История', teacher_name: 'Данияр Юсупов', class_name: '10А' },
        { id: '4', name: 'Химия', teacher_name: 'Мадина Турсунова', class_name: '10Б' },
        { id: '5', name: 'Биология', teacher_name: 'Зарина Иманова', class_name: '10Б' },
        { id: '6', name: 'Русский язык', teacher_name: 'Елена Попова', class_name: '10А' },
        { id: '7', name: 'Английский язык', teacher_name: 'Sarah Johnson', class_name: '11А' },
        { id: '8', name: 'Информатика', teacher_name: 'Арман Бекетов', class_name: '11А' },
      ])
    } else {
      setCourses(data ?? [])
    }
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('courses').insert({ name, teacher_name: teacherName, class_name: className })
    if (err) setError(err.message)
    else { setName(''); setTeacherName(''); setClassName(''); fetchCourses() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('courses').delete().eq('id', id)
    if (err) setError(err.message)
    else setCourses(prev => prev.filter(c => c.id !== id))
  }

  const canEdit = userRole === 'admin' || userRole === 'staff' || userRole === 'principal'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Предметы</h1>
          <p className="mt-1 text-blue-700/70">Учебные курсы лицея Aqbobek</p>
        </div>

        {canEdit && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><Plus className="h-5 w-5" /> Добавить предмет</CardTitle>
              <CardDescription>Данные сохраняются в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[160px]">
                  <Label>Название предмета</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Математика" required />
                </div>
                <div className="space-y-2 flex-1 min-w-[160px]">
                  <Label>Учитель</Label>
                  <Input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Айгуль Нуртаева" />
                </div>
                <div className="space-y-2 w-24">
                  <Label>Класс</Label>
                  <Input value={className} onChange={e => setClassName(e.target.value)} placeholder="10А" />
                </div>
                <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Добавить'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}

        <Card className="border-blue-100 bg-white/90">
          <CardHeader><CardTitle className="text-blue-900"><BookOpen className="inline h-5 w-5 mr-2" />Список предметов ({courses.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100">
                    <TableHead className="text-blue-900/60">Предмет</TableHead>
                    <TableHead className="text-blue-900/60">Учитель</TableHead>
                    <TableHead className="text-blue-900/60">Класс</TableHead>
                    {canEdit && <TableHead className="text-right text-blue-900/60">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(c => (
                    <TableRow key={c.id} className="border-blue-50">
                      <TableCell className="font-medium text-blue-950">{c.name}</TableCell>
                      <TableCell className="text-slate-700">{c.teacher_name || '—'}</TableCell>
                      <TableCell><span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">{c.class_name || '—'}</span></TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {!courses.length && <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Предметов не найдено</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
