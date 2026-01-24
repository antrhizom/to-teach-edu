import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800', '900']
})

export const metadata: Metadata = {
  title: 'to-teach.ai Weiterbildung',
  description: 'Moderne Weiterbildungsplattform für digitales Lernen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
