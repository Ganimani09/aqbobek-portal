'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LogOut, UserCircle, LayoutDashboard, BarChart3, Bell, Calendar,
  BookOpen, Users, GraduationCap, Briefcase, ClipboardList,
  UserPlus, FileText, CreditCard, Settings
} from 'lucide-react'

type NavLink = { href: string; label: string; icon: React.ReactNode }

export default function Sidebar() {
  const { user, userRole, signOut } = useAuth()
  const pathname = usePathname()

  // Hide sidebar on auth pages and kiosk
  if (pathname === '/login' || pathname === '/register' || pathname === '/signup' || pathname === '/kiosk') {
    return null
  }

  let links: NavLink[] = []

  if (user) {
    if (userRole === 'admin' || userRole === 'staff' || userRole === 'principal') {
      links = [
        { href: '/admin/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} /> },
        { href: '/students', label: 'Ученики', icon: <Users size={18} /> },
        { href: '/teachers', label: 'Учителя', icon: <GraduationCap size={18} /> },
        { href: '/staff', label: 'Персонал', icon: <Briefcase size={18} /> },
        { href: '/courses', label: 'Предметы', icon: <BookOpen size={18} /> },
        { href: '/grade-book', label: 'Журнал оценок', icon: <ClipboardList size={18} /> },
        { href: '/admissions', label: 'Приём', icon: <UserPlus size={18} /> },
        { href: '/fees', label: 'Оплата', icon: <CreditCard size={18} /> },
        { href: '/analytics', label: 'Аналитика', icon: <BarChart3 size={18} /> },
        { href: '/events', label: 'Мероприятия', icon: <Calendar size={18} /> },
        { href: '/announcements', label: 'Объявления', icon: <Bell size={18} /> },
        { href: '/resources', label: 'Ресурсы', icon: <FileText size={18} /> },
        { href: '/school-settings', label: 'Настройки', icon: <Settings size={18} /> },
      ]
    } else if (userRole === 'teacher') {
      links = [
        { href: '/teacher/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} /> },
        { href: '/students', label: 'Ученики', icon: <Users size={18} /> },
        { href: '/courses', label: 'Предметы', icon: <BookOpen size={18} /> },
        { href: '/grade-book', label: 'Журнал оценок', icon: <ClipboardList size={18} /> },
        { href: '/analytics', label: 'Аналитика', icon: <BarChart3 size={18} /> },
        { href: '/events', label: 'Мероприятия', icon: <Calendar size={18} /> },
        { href: '/announcements', label: 'Объявления', icon: <Bell size={18} /> },
        { href: '/resources', label: 'Ресурсы', icon: <FileText size={18} /> },
      ]
    } else if (userRole === 'student') {
      links = [
        { href: '/student/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} /> },
        { href: '/courses', label: 'Предметы', icon: <BookOpen size={18} /> },
        { href: '/events', label: 'Мероприятия', icon: <Calendar size={18} /> },
        { href: '/announcements', label: 'Объявления', icon: <Bell size={18} /> },
        { href: '/resources', label: 'Ресурсы', icon: <FileText size={18} /> },
      ]
    } else if (userRole === 'parent') {
      links = [
        { href: '/parent/dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} /> },
        { href: '/events', label: 'Мероприятия', icon: <Calendar size={18} /> },
        { href: '/announcements', label: 'Объявления', icon: <Bell size={18} /> },
        { href: '/fees', label: 'Оплата', icon: <CreditCard size={18} /> },
      ]
    }

    links.push({ href: `/profile/${user.id}`, label: 'Профиль', icon: <UserCircle size={18} /> })
  }

  return (
    <div className="flex h-full w-64 shrink-0 flex-col bg-gradient-to-b from-blue-900 via-blue-850 to-blue-800 text-white shadow-xl">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-blue-50">Aqbobek Portal</h1>
        <p className="mt-0.5 text-xs text-blue-300/70">Школьная система управления</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {!user ? (
            <li>
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-blue-700/50"
              >
                <UserCircle size={18} />
                <span>Вход</span>
              </Link>
            </li>
          ) : (
            links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-blue-600/70 font-medium text-white shadow-sm'
                        : 'text-blue-100/80 hover:bg-blue-700/40 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              )
            })
          )}
        </ul>
      </nav>

      {user && (
        <div className="border-t border-blue-700/40 px-3 py-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-blue-200/80 transition-colors hover:bg-blue-700/40 hover:text-white"
          >
            <LogOut size={18} />
            <span>Выйти</span>
          </button>
        </div>
      )}
    </div>
  )
}
