'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      router.push('/login')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role
        if (role === 'admin' || role === 'staff' || role === 'principal') {
          router.push('/admin/dashboard')
        } else if (role === 'teacher') {
          router.push('/teacher/dashboard')
        } else if (role === 'student') {
          router.push('/student/dashboard')
        } else if (role === 'parent') {
          router.push('/parent/dashboard')
        } else {
          router.push('/login')
        }
      } catch (e) {
        console.error('Error in root page redirect:', e)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
         <p className="text-sm font-medium text-slate-500">Загрузка портала...</p>
      </div>
    </div>
  )
}
