import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'One-Tap Deploy - Install IMPACT Course Admin',
  description: 'One-click deployment for IMPACT Course Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
