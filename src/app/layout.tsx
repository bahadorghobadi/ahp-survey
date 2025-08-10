import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AHP Survey - University of Tehran',
  description: 'Geomagnetic Observatory Site Selection Survey using AHP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}