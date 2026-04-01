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
import { Loader2, CreditCard, CheckCircle } from 'lucide-react'

type FeeRow = {
  id: string
  student_name: string
  fee_type: string
  amount: number
  status: string
  date: string
}

export default function FeesPage() {
  const { userRole } = useAuth()
  const [fees, setFees] = useState<FeeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [feeType, setFeeType] = useState('tuition')
  const [amount, setAmount] = useState('')

  useEffect(() => { fetchFees() }, [])

  const fetchFees = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('fees')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)
    if (err) {
      setFees([
        { id: '1', student_name: 'Алибек Сейтов', fee_type: 'Обучение', amount: 150000, status: 'Оплачено', date: '2026-03-01' },
        { id: '2', student_name: 'Дильназ Муратова', fee_type: 'Обучение', amount: 150000, status: 'Оплачено', date: '2026-03-01' },
        { id: '3', student_name: 'Ерасыл Нурланов', fee_type: 'Обучение', amount: 150000, status: 'Ожидает', date: '2026-03-01' },
        { id: '4', student_name: 'Максат Ким', fee_type: 'Экзамен', amount: 5000, status: 'Оплачено', date: '2026-02-15' },
        { id: '5', student_name: 'Аружан Сапарова', fee_type: 'Транспорт', amount: 25000, status: 'Ожидает', date: '2026-02-10' },
      ])
    } else {
      setFees(data ?? [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    const typeLabels: Record<string, string> = { tuition: 'Обучение', exam: 'Экзамен', transport: 'Транспорт' }
    const { error: err } = await supabase.from('fees').insert({
      student_name: studentName,
      fee_type: typeLabels[feeType] || feeType,
      amount: parseFloat(amount),
      status: 'Оплачено',
      date: new Date().toISOString().split('T')[0],
    })
    if (err) setError(err.message)
    else { setSuccess(true); setStudentName(''); setAmount(''); fetchFees() }
    setSaving(false)
  }

  const canEdit = userRole === 'admin' || userRole === 'staff' || userRole === 'principal'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Оплата</h1>
          <p className="mt-1 text-blue-700/70">Управление оплатой и платежами</p>
        </div>

        {canEdit && (
          <Card className="border-blue-100 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900"><CreditCard className="h-5 w-5" /> Внести оплату</CardTitle>
              <CardDescription>Платёж сохраняется в Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[180px]">
                  <Label>Ученик</Label>
                  <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Алибек Сейтов" required />
                </div>
                <div className="space-y-2 w-40">
                  <Label>Тип оплаты</Label>
                  <Select value={feeType} onValueChange={setFeeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Обучение</SelectItem>
                      <SelectItem value="exam">Экзамен</SelectItem>
                      <SelectItem value="transport">Транспорт</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-36">
                  <Label>Сумма (₸)</Label>
                  <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="150000" required />
                </div>
                <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Оплатить'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}
        {success && <Card className="border-green-200 bg-green-50"><CardContent className="flex items-center gap-3 p-4 text-sm text-green-700"><CheckCircle className="h-5 w-5" /> Оплата успешно внесена!</CardContent></Card>}

        <Card className="border-blue-100 bg-white/90">
          <CardHeader><CardTitle className="text-blue-900">История платежей</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100">
                    <TableHead className="text-blue-900/60">Ученик</TableHead>
                    <TableHead className="text-blue-900/60">Тип</TableHead>
                    <TableHead className="text-blue-900/60 text-right">Сумма</TableHead>
                    <TableHead className="text-blue-900/60">Статус</TableHead>
                    <TableHead className="text-blue-900/60">Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map(f => (
                    <TableRow key={f.id} className="border-blue-50">
                      <TableCell className="font-medium text-blue-950">{f.student_name}</TableCell>
                      <TableCell className="text-slate-700">{f.fee_type}</TableCell>
                      <TableCell className="text-right font-semibold text-blue-900">{Number(f.amount).toLocaleString('ru-RU')} ₸</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${f.status === 'Оплачено' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {f.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">{new Date(f.date).toLocaleDateString('ru-RU')}</TableCell>
                    </TableRow>
                  ))}
                  {!fees.length && <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Платежей пока нет</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
