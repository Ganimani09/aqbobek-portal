'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserPlus, CheckCircle } from 'lucide-react'

export default function AdmissionsPage() {
  const { userRole } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [grade, setGrade] = useState('10А')
  const [parentName, setParentName] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: err } = await supabase.from('admissions').insert({
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob,
      grade,
      parent_name: parentName,
      contact_number: contactNumber,
      status: 'pending',
    })

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setFirstName(''); setLastName(''); setDob(''); setParentName(''); setContactNumber('')
    }
    setSaving(false)
  }

  if (userRole !== 'admin' && userRole !== 'staff' && userRole !== 'principal') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-blue-900">Приём учеников</h1>
          <p className="mt-4 text-slate-600">У вас нет доступа к этой странице.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Приём учеников</h1>
          <p className="mt-1 text-blue-700/70">Заявки на зачисление в лицей</p>
        </div>

        <Card className="border-blue-100 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900"><UserPlus className="h-5 w-5" /> Новая заявка</CardTitle>
            <CardDescription>Заявка сохраняется в Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Алибек" required />
                </div>
                <div className="space-y-2">
                  <Label>Фамилия</Label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Сейтов" required />
                </div>
                <div className="space-y-2">
                  <Label>Дата рождения</Label>
                  <Input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Класс</Label>
                  <Select value={grade} onValueChange={setGrade}>
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
                <div className="space-y-2">
                  <Label>ФИО родителя</Label>
                  <Input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Марат Сейтов" required />
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="+7 777 123 45 67" required />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-blue-700 hover:bg-blue-800">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Подать заявку'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-green-700">
              <CheckCircle className="h-5 w-5" /> Заявка успешно отправлена!
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
