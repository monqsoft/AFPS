import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { getSession } from "@/lib/auth" // Server-side session fetching

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AFPS - Associação de Futebol de Porto dos Santos",
  description: "Sistema Gerencial da AFPS",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession() // Fetch session on the server for Navbar

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Pass session to Navbar. Navbar itself is a client component but receives server-fetched prop */}
          <Navbar session={session} />
          <main className="container mx-auto p-4 md:p-8 flex-grow">{children}</main>
          <Toaster />
          {/* Footer can be added here */}
        </ThemeProvider>
      </body>
    </html>
  )
}
