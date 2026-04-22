import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rubix Solver — AI Cube Scanner',
  description: 'Scan your Rubik\'s cube and get the solution instantly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}