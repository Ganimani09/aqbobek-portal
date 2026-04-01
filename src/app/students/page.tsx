'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, UserPlus, Trash2 } from 'lucide-react'

type StudentRow = {
  id: string
  full_name: string
  role: string
  email?: string
  created_at?: string
}

export default function StudentsPage() {
  const { userRole } = useAuth()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newClass, setNewClass] = useState('10А')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    const { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('role', 'student')
      .order('full_name')

    if (fetchErr) {
      console.error(fetchErr)
      setError('Не удалось загрузить учеников')
    } else {
      setStudents(data ?? [])
    }
    setLoading(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error: insertErr } = await supabase
      .from('profiles')
      .insert({
        full_name: newName,
        role: 'student',
      })

    if (insertErr) {
      setError(insertErr.message)
    } else {
      setNewName('')
      setNewEmail('')
      fetchStudents()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error: delErr } = await supabase.from('profiles').delete().eq('id', id)
    if (delErr) {
      setError(delErr.message)
    } else {
      setStudents(prev => prev.filter(s => s.id !== id))
    }
  }

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">Ученики</h1>
            <p className="mt-1 text-blue-700/70">Управление учениками лицея</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск по имени..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        {(userRole === 'admin' || userRole === 'staff' || userRole === 'principal') && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <UserPlus className="h-5 w-5" /> Добавить ученика
              </CardTitle>
              <CardDescription>Данные сохраняются в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label htmlFor="name">ФИО ученика</Label>
                  <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Алибек Сейтов" required />
                </div>
                <div className="space-y-2 w-32">
                  <Label>Класс</Label>
                  <Select value={newClass} onValueChange={setNewClass}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8А">8А</SelectItem>
                      <SelectItem value="8Б">8Б</SelectItem>
                      <SelectItem value="9А">9А</SelectItem>
                      <SelectItem value="9Б">9Б</SelectItem>
                      <SelectItem value="10А">10А</SelectItem>
                      <SelectItem value="10Б">10Б</SelectItem>
                      <SelectItem value="11А">11А</SelectItem>
                      <SelectItem value="11Б">11Б</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Добавить'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card className="border-blue-100 bg-white/90">
          <CardHeader>
            <CardTitle className="text-blue-900">Список учеников ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-100">
                      <TableHead className="text-blue-900/60">ФИО</TableHead>
                      <TableHead className="text-blue-900/60">Роль</TableHead>
                      <TableHead className="text-blue-900/60">Дата регистрации</TableHead>
                      {(userRole === 'admin' || userRole === 'staff') && (
                        <TableHead className="text-right text-blue-900/60">Действия</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(student => (
                      <TableRow key={student.id} className="border-blue-50">
                        <TableCell className="font-medium text-blue-950">{student.full_name || 'Без имени'}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Ученик</span>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {student.created_at ? new Date(student.created_at).toLocaleDateString('ru-RU') : '—'}
                        </TableCell>
                        {(userRole === 'admin' || userRole === 'staff') && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {!filtered.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          Учеников не найдено
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
