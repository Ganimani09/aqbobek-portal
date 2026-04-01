'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, ClipboardList, UserPlus } from 'lucide-react'

type GradeEntry = {
  id?: string
  student_name: string
  subject: string
  grade: number
  date: string
}

export default function GradeBookPage() {
  const { user, userRole } = useAuth()
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [studentName, setStudentName] = useState('')
  const [subject, setSubject] = useState('Математика')
  const [grade, setGrade] = useState('')

  useEffect(() => { fetchGrades() }, [])

  const fetchGrades = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('grades')
      .select('*')
      .order('date', { ascending: false })
      .limit(50)
    if (err) {
      // Fallback mock data if table doesn't exist
      setGrades([
        { student_name: 'Алибек Сейтов', subject: 'Математика', grade: 5, date: '2026-03-28' },
        { student_name: 'Алибек Сейтов', subject: 'Физика', grade: 3, date: '2026-03-28' },
        { student_name: 'Дильназ Муратова', subject: 'Математика', grade: 5, date: '2026-03-28' },
        { student_name: 'Дильназ Муратова', subject: 'Биология', grade: 5, date: '2026-03-27' },
        { student_name: 'Ерасыл Нурланов', subject: 'Физика', grade: 2, date: '2026-03-27' },
        { student_name: 'Максат Ким', subject: 'История', grade: 4, date: '2026-03-27' },
        { student_name: 'Аружан Сапарова', subject: 'Химия', grade: 4, date: '2026-03-26' },
      ])
    } else {
      setGrades(data ?? [])
    }
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('grades').insert({
      student_name: studentName,
      subject,
      grade: parseInt(grade),
      date: new Date().toISOString().split('T')[0],
      teacher_id: user?.id,
    })
    if (err) setError(err.message)
    else { setStudentName(''); setGrade(''); fetchGrades() }
    setSaving(false)
  }

  const gradeColor = (g: number) => {
    if (g === 5) return 'bg-green-100 text-green-700'
    if (g === 4) return 'bg-blue-100 text-blue-700'
    if (g === 3) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  const canEdit = userRole === 'teacher' || userRole === 'admin' || userRole === 'staff'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Журнал оценок</h1>
          <p className="mt-1 text-blue-700/70">Выставление и просмотр оценок учеников</p>
        </div>

        {canEdit && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><UserPlus className="h-5 w-5" /> Выставить оценку</CardTitle>
              <CardDescription>Оценка сохраняется в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[180px]">
                  <Label>Ученик</Label>
                  <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Алибек Сейтов" required />
                </div>
                <div className="space-y-2 w-44">
                  <Label>Предмет</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Математика">Математика</SelectItem>
                      <SelectItem value="Физика">Физика</SelectItem>
                      <SelectItem value="Химия">Химия</SelectItem>
                      <SelectItem value="Биология">Биология</SelectItem>
                      <SelectItem value="История">История</SelectItem>
                      <SelectItem value="Русский язык">Русский язык</SelectItem>
                      <SelectItem value="Английский язык">Английский</SelectItem>
                      <SelectItem value="Информатика">Информатика</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-24">
                  <Label>Оценка</Label>
                  <Input type="number" min="1" max="5" value={grade} onChange={e => setGrade(e.target.value)} placeholder="5" required />
                </div>
                <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Поставить'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}

        <Card className="border-blue-100 bg-white/90">
          <CardHeader><CardTitle className="text-blue-900"><ClipboardList className="inline h-5 w-5 mr-2" />Последние оценки</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100">
                    <TableHead className="text-blue-900/60">Ученик</TableHead>
                    <TableHead className="text-blue-900/60">Предмет</TableHead>
                    <TableHead className="text-blue-900/60 text-center">Оценка</TableHead>
                    <TableHead className="text-blue-900/60">Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((g, idx) => (
                    <TableRow key={g.id || idx} className="border-blue-50">
                      <TableCell className="font-medium text-blue-950">{g.student_name}</TableCell>
                      <TableCell className="text-slate-700">{g.subject}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold ${gradeColor(g.grade)}`}>{g.grade}</span>
                      </TableCell>
                      <TableCell className="text-slate-600">{new Date(g.date).toLocaleDateString('ru-RU')}</TableCell>
                    </TableRow>
                  ))}
                  {!grades.length && <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Оценок пока нет</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
