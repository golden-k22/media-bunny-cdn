import './globals.css'
import { NextUIProvider } from '@nextui-org/react'
import { Inter } from 'next/font/google'
import AppNavbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Media Upload & CDN',
  description: 'Upload and optimize media files with Bunny.net CDN',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <NextUIProvider>
          <AppNavbar />
          {children}
        </NextUIProvider>
      </body>
    </html>
  )
}