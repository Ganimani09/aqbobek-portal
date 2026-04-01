import type { Metadata } from 'next'
import { Geist, Azeret_Mono as Geist_Mono } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'


const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Aqbobek Lyceum Portal',
  description: 'Школьная система управления лицея Aqbobek',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
            <Toaster/>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
