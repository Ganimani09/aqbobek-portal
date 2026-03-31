'use client'
import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Dashboard() {
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
        return
      }
      supabase.from('profiles').select('role').eq('id', data.user.id).single()
        .then(({ data: profile }) => {
          const role = profile?.role
          if (role === 'admin') window.location.href = '/admin/dashboard'
          else if (role === 'teacher') window.location.href = '/teacher/dashboard'
          else if (role === 'student') window.location.href = '/student/dashboard'
          else if (role === 'parent') window.location.href = '/parent/dashboard'
          else window.location.href = '/login'
        })
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Загрузка...</p>
    </div>
  )
}
