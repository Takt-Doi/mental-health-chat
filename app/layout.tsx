import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LogoutButton } from '@/components/logout-button'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700']
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'こころのサポートAI - CBTベースカウンセリング',
  description: 'AIと対話しながら認知行動療法（CBT）ベースのカウンセリングを受けられるサービス。メンタルヘルス、ハラスメント、キャリア、エンゲージメントなど様々なご相談に対応します。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#00CC99',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="bg-background">
      <body className={`${notoSansJP.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <LogoutButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
