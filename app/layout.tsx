import type { Metadata, Viewport } from 'next'
import { Fredoka, Comic_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

const fredoka = Fredoka({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

const comicNeue = Comic_Neue({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-comic'
});

export const metadata: Metadata = {
  title: 'Monster Truck Coloring Book',
  description: 'The ultimate monster truck coloring book for kids! Color epic trucks, scan your own toys with AI, and create amazing artwork.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/app-icon-192.jpg',
    apple: '/app-icon-512.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Color Trucks',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f1eb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${fredoka.variable} ${comicNeue.variable} font-sans antialiased`}>
        {children}
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  )
}
