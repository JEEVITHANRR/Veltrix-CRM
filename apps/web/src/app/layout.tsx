// apps/web/src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Veltrix CRM — Cinematic AI-Powered Sales Platform',
    template: '%s | Veltrix CRM',
  },
  description: 'A world-class AI-powered CRM platform for modern sales teams. Track leads, automate follow-ups, and unlock insights with cinematic 3D experience.',
  keywords: ['CRM', 'AI', 'Sales', 'Lead tracking', 'Pipeline management'],
  authors: [{ name: 'Veltrix Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    title: 'Veltrix CRM',
    description: 'Cinematic AI-powered CRM for modern sales teams.',
    siteName: 'Veltrix CRM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veltrix CRM',
    description: 'Cinematic AI-powered CRM for modern sales teams.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#800020',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased noise">
        {children}
      </body>
    </html>
  )
}
