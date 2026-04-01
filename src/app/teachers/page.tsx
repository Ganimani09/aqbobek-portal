'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Search, Trash2, UserPlus } from 'lucide-react'

type TeacherRow = {
  id: string
  full_name: string
  role: string
  created_at?: string
}

export default function TeachersPage() {
  const { userRole } = useAuth()
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    setLoading(true)
    const { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('role', 'teacher')
      .order('full_name')

    if (fetchErr) {
      setError('Не удалось загрузить учителей')
    } else {
      setTeachers(data ?? [])
    }
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('profiles').insert({ full_name: newName, role: 'teacher' })
    if (err) setError(err.message)
    else { setNewName(''); fetchTeachers() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('profiles').delete().eq('id', id)
    if (err) setError(err.message)
    else setTeachers(prev => prev.filter(t => t.id !== id))
  }

  const filtered = teachers.filter(t => t.full_name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">Учителя</h1>
            <p className="mt-1 text-blue-700/70">Управление педагогическим составом</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
        </div>

        {(userRole === 'admin' || userRole === 'staff' || userRole === 'principal') && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><UserPlus className="h-5 w-5" /> Добавить учителя</CardTitle>
              <CardDescription>Данные сохраняются в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label>ФИО учителя</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Айгуль Нуртаева" required />
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
          <CardHeader><CardTitle className="text-blue-900">Список учителей ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100">
                    <TableHead className="text-blue-900/60">ФИО</TableHead>
                    <TableHead className="text-blue-900/60">Роль</TableHead>
                    <TableHead className="text-blue-900/60">Дата регистрации</TableHead>
                    {(userRole === 'admin' || userRole === 'staff') && <TableHead className="text-right text-blue-900/60">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => (
                    <TableRow key={t.id} className="border-blue-50">
                      <TableCell className="font-medium text-blue-950">{t.full_name || 'Без имени'}</TableCell>
                      <TableCell><span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Учитель</span></TableCell>
                      <TableCell className="text-slate-600">{t.created_at ? new Date(t.created_at).toLocaleDateString('ru-RU') : '—'}</TableCell>
                      {(userRole === 'admin' || userRole === 'staff') && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {!filtered.length && <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Учителей не найдено</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
