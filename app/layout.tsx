import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'moju — Full commitment, with zero delivery',
  description: 'A tiny studio with huge feelings and questionable timelines.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
