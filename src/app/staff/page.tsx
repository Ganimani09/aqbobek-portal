'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Briefcase, Trash2, UserPlus } from 'lucide-react'

type StaffRow = {
  id: string
  full_name: string
  role: string
  created_at?: string
}

export default function StaffPage() {
  const { userRole } = useAuth()
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .in('role', ['staff', 'admin', 'principal'])
      .order('full_name')
    if (err) setError('Не удалось загрузить персонал')
    else setStaff(data ?? [])
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('profiles').insert({ full_name: newName, role: newRole || 'staff' })
    if (err) setError(err.message)
    else { setNewName(''); setNewRole(''); fetchStaff() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('profiles').delete().eq('id', id)
    if (err) setError(err.message)
    else setStaff(prev => prev.filter(s => s.id !== id))
  }

  const roleLabel = (role: string) => {
    if (role === 'admin') return { text: 'Админ', cls: 'bg-purple-100 text-purple-700' }
    if (role === 'principal') return { text: 'Директор', cls: 'bg-amber-100 text-amber-700' }
    return { text: 'Персонал', cls: 'bg-slate-100 text-slate-700' }
  }

  const canEdit = userRole === 'admin' || userRole === 'principal'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Персонал</h1>
          <p className="mt-1 text-blue-700/70">Администрация и сотрудники лицея</p>
        </div>

        {canEdit && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><UserPlus className="h-5 w-5" /> Добавить сотрудника</CardTitle>
              <CardDescription>Данные сохраняются в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label>ФИО</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Иван Петров" required />
                </div>
                <div className="space-y-2 w-40">
                  <Label>Должность</Label>
                  <Input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="staff" />
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
          <CardHeader><CardTitle className="text-blue-900"><Briefcase className="inline h-5 w-5 mr-2" />Список персонала ({staff.length})</CardTitle></CardHeader>
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
                    {canEdit && <TableHead className="text-right text-blue-900/60">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map(s => {
                    const rl = roleLabel(s.role)
                    return (
                      <TableRow key={s.id} className="border-blue-50">
                        <TableCell className="font-medium text-blue-950">{s.full_name || 'Без имени'}</TableCell>
                        <TableCell><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${rl.cls}`}>{rl.text}</span></TableCell>
                        <TableCell className="text-slate-600">{s.created_at ? new Date(s.created_at).toLocaleDateString('ru-RU') : '—'}</TableCell>
                        {canEdit && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                  {!staff.length && <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Персонал не найден</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
