'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Settings, CheckCircle } from 'lucide-react'

export default function SchoolSettingsPage() {
  const { user, userRole } = useAuth()
  const [schoolName, setSchoolName] = useState('Aqbobek Lyceum')
  const [schoolAddress, setSchoolAddress] = useState('г. Алматы, мкр. Айнабулак-3, д. 42')
  const [schoolDescription, setSchoolDescription] = useState('Инновационный образовательный лицей с углублённым изучением STEM направлений.')
  const [schoolPhone, setSchoolPhone] = useState('+7 727 123 45 67')
  const [schoolEmail, setSchoolEmail] = useState('info@aqbobek.kz')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single()
      if (data) {
        setSchoolName(data.name || schoolName)
        setSchoolAddress(data.address || schoolAddress)
        setSchoolDescription(data.description || schoolDescription)
        setSchoolPhone(data.phone || schoolPhone)
        setSchoolEmail(data.email || schoolEmail)
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: err } = await supabase.from('school_settings').upsert({
      id: 1,
      name: schoolName,
      address: schoolAddress,
      description: schoolDescription,
      phone: schoolPhone,
      email: schoolEmail,
      updated_by: user?.id,
    })

    if (err) setError(err.message)
    else setSuccess(true)
    setSaving(false)
  }

  if (userRole !== 'admin' && userRole !== 'principal') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-blue-900">Настройки школы</h1>
          <p className="mt-4 text-slate-600">У вас нет доступа к настройкам.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Настройки школы</h1>
          <p className="mt-1 text-blue-700/70">Информация о лицее</p>
        </div>

        <Card className="border-blue-100 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900"><Settings className="h-5 w-5" /> Информация о школе</CardTitle>
            <CardDescription>Данные сохраняются в Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Название школы</Label>
                <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Адрес</Label>
                <Input value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input value={schoolPhone} onChange={e => setSchoolPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea value={schoolDescription} onChange={e => setSchoolDescription(e.target.value)} rows={4} />
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-blue-700 hover:bg-blue-800">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Сохранить настройки'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}
        {success && <Card className="border-green-200 bg-green-50"><CardContent className="flex items-center gap-3 p-4 text-sm text-green-700"><CheckCircle className="h-5 w-5" /> Настройки успешно сохранены!</CardContent></Card>}
      </div>
    </main>
  )
}
