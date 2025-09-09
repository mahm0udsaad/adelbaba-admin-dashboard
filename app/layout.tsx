import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ConditionalShell from '@/components/conditional-shell'

export const metadata: Metadata = {
  title: 'Admin - Dashboard',
  generator: 'Admin Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ConditionalShell>{children}</ConditionalShell>
        <Analytics />
      </body>
    </html>
  )
}
