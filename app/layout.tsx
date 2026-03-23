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
  description: 'A fun digital coloring book for kids featuring awesome Monster Trucks!',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/app-icon-192.jpg',
    apple: '/app-icon-512.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Color Trucks',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#87CEEB',
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
