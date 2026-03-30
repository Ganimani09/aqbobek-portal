'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type RegisterRole = 'student' | 'teacher' | 'parent'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RegisterRole | ''>('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
      )
    }

    return createClient(supabaseUrl, supabaseAnonKey)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!role) {
      setErrorMessage('Выберите роль перед регистрацией.')
      return
    }

    setLoading(true)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (signUpError) {
      setErrorMessage(signUpError.message)
      setLoading(false)
      return
    }

    const userId = signUpData.user?.id

    if (!userId) {
      setErrorMessage('Пользователь создан некорректно. Попробуйте снова.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      role,
    })

    if (profileError) {
      setErrorMessage(profileError.message)
      setLoading(false)
      return
    }

    setSuccessMessage('Регистрация успешна! Теперь войдите в систему.')
    setLoading(false)
    router.push('/login')
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),transparent_45%)]" />
      <Card className="relative z-10 w-full max-w-md border-white/30 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-blue-900">
            Aqbobek Lyceum Portal
          </CardTitle>
          <CardDescription className="text-blue-700">
            Создайте аккаунт для доступа к школьному порталу
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Введите полное имя"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Роль</Label>
              <Select value={role} onValueChange={(value) => setRole(value as RegisterRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Ученик</SelectItem>
                  <SelectItem value="teacher">Учитель</SelectItem>
                  <SelectItem value="parent">Родитель</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
              {loading ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-700">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="font-medium text-blue-700 hover:text-blue-900 hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
