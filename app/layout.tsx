import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Speech Suite · STT / TTS Studio',
  description: 'Browser-first speech-to-text & text-to-speech studio — free by default, OpenAI Whisper & TTS optional.',
  keywords: ['speech-to-text', 'text-to-speech', 'AI', 'voice', 'accessibility'],
  authors: [{ name: 'William Jiang' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

// Next.js 14+ requires the `viewport` export separately from `metadata`.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}
