import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ollamito — AI Chat',
  description: 'End-to-end AI chat interface powered by Ollama',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans font-light">{children}</body>
    </html>
  )
}