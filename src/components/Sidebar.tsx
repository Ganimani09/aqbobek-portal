'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, UserCircle, LayoutDashboard } from 'lucide-react'

export default function Sidebar() {
  const { user, userRole, signOut } = useAuth()
  const pathname = usePathname()

  // Hide sidebar on auth pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/signup') {
    return null
  }

  // Define links based on roles. Only working links.
  let links: { href: string; label: string; icon: React.ReactNode }[] = []

  if (user) {
    if (userRole === 'admin' || userRole === 'staff' || userRole === 'principal') {
      links = [
        { href: '/admin/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
      ]
    } else if (userRole === 'teacher') {
      links = [
        { href: '/teacher/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
      ]
    } else if (userRole === 'student') {
      links = [
        { href: '/student/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
      ]
    } else if (userRole === 'parent') {
      links = [
        { href: '/parent/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
      ]
    }
    
    // Everyone gets profile
    links.push({ href: `/profile/${user.id}`, label: 'Профиль', icon: <UserCircle size={20} /> })
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-blue-900 to-blue-800 p-4 text-white shadow-xl">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-blue-50">Aqbobek Portal</h1>
      <nav className="flex-1">
        <ul className="space-y-2">
          {!user ? (
            <li>
              <Link 
                href="/login" 
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${pathname === '/login' ? 'bg-blue-700 font-medium' : 'hover:bg-blue-800/50'}`}
              >
                <UserCircle size={20} />
                <span>Вход</span>
              </Link>
            </li>
          ) : (
            links.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${pathname === link.href ? 'bg-blue-700 font-medium text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </nav>
      {user && (
        <div className="mt-auto pt-4 border-t border-blue-700/50">
           <button 
             onClick={signOut} 
             className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left text-blue-100 transition-colors hover:bg-blue-800 hover:text-white"
           >
             <LogOut size={20} />
             <span>Выйти</span>
           </button>
        </div>
      )}
    </div>
  )
}
