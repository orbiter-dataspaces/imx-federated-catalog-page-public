import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import packageInfo from '../package.json'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'IMX Federated Credential Catalog',
  description:
    'Explore Gaia-X compliant verifiable credentials from the IMX federated dataspace with rich filtering and discovery tools.',
  generator: 'Orbiter Dataspaces',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const appVersion = packageInfo.version

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.className} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-border bg-card">
              <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-foreground">
                  <span className="font-medium">LNI 4.0</span>
                  <span aria-hidden="true">•</span>
                  <Link
                    href="https://github.com/orbiter-dataspaces/imx-federated-catalog-page/releases"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    Version {appVersion}
                  </Link>
                  <span aria-hidden="true">•</span>
                  <Link
                    href="https://truzzt.eu"
                    target="_blank"
                    rel="noreferrer"
                    className="italic text-primary transition-colors hover:text-foreground"
                  >
                    charging trust, powered by truzzt
                  </Link>
                </div>
                <nav className="flex items-center gap-6">
                  <Link href="/imprint" className="transition-colors hover:text-foreground">
                    Imprint
                  </Link>
                  <Link href="/privacy" className="transition-colors hover:text-foreground">
                    Privacy
                  </Link>
                </nav>
              </div>
            </footer>
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
