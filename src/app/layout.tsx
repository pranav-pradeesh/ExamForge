import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ExamForge — JEE, VITEEE, KEAM, CUSAT & NEET Prep',
    template: '%s | ExamForge',
  },
  description: 'Free AI-powered CBT mock exams for JEE Main 2026, JEE Advanced, VITEEE, KEAM, CUSAT CAT and NEET. Real PYQs, instant AI analysis, progress tracking.',
  keywords: [
    'JEE mock test 2026','VITEEE mock test 2026','KEAM mock test 2026',
    'CUSAT CAT mock test','NEET mock test','JEE Main preparation',
    'JEE Advanced preparation','VITEEE preparation','KEAM preparation',
    'CUSAT preparation','NEET preparation','free mock test online',
    'CBT practice test','previous year questions','JEE AI analysis',
    'exam preparation India','physics chemistry mathematics biology',
    'online test series','JEE rank predictor',
  ],
  authors: [{ name: 'ExamForge' }],
  creator: 'ExamForge',
  publisher: 'ExamForge',
  metadataBase: new URL('https://examprep-peach.vercel.app'),
  alternates: { canonical: '/' },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://examprep-peach.vercel.app',
    siteName: 'ExamForge',
    title: 'ExamForge — JEE, VITEEE, KEAM, CUSAT & NEET Prep',
    description: 'Free AI-powered mock exams. Authentic CBT. Real PYQs. Instant AI analysis. JEE · VITEEE · KEAM · CUSAT · NEET.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ExamForge — AI Exam Prep' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExamForge — Free AI Exam Prep',
    description: 'JEE, VITEEE, KEAM, CUSAT, NEET mock tests with instant AI analysis.',
    images: ['/og-image.png'],
  },
  category: 'education',
  applicationName: 'ExamForge',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#010101' },
    { media: '(prefers-color-scheme: light)', color: '#010101' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://joqlnecojcewupknphre.supabase.co" />
        <link rel="dns-prefetch" href="https://api.groq.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ExamForge" />
      </head>
      <body>{children}</body>
    </html>
  )
}
