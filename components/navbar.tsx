"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { logoutAction } from "@/app/login/actions" // Server action for logout

interface SessionData {
  cpf: string
  role: "jogador" | "admin"
  nome: string
}

// This component needs to fetch session data.
// For a real app, consider a context or a hook that uses a server action.
// For simplicity, we'll try a client-side fetch on mount or use a server component wrapper.
// Given Next.js, direct client-side cookie access is not ideal for httpOnly.
// We'll use a state variable that could be populated by a parent server component or an effect.

export default function Navbar({ session }: { session: SessionData | null }) {
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: `/jogadores/${session?.cpf}`, label: "Meu Perfil", roles: ["jogador", "admin"] }, // Link to own profile
    { href: "/jogadores", label: "Jogadores", roles: ["admin"] },
    { href: "/gerenciamento", label: "Gerenciamento", roles: ["admin"] },
    { href: "/transparencia", label: "Transparência", roles: ["jogador", "admin"] },
  ]

  const filteredLinks = navLinks.filter((link) => {
    if (!session) return !link.roles // Show public links if any (none defined here)
    return !link.roles || link.roles.includes(session.role)
  })

  if (pathname === "/login") return null // Don't show navbar on login page

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between max-w-7xl px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo-afps.png" alt="AFPS Logo" width={40} height={40} />
          <span className="font-bold text-xl text-secondary dark:text-primary">AFPS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-lg font-medium">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session && (
            <form action={logoutAction} className="hidden md:block">
              <Button
                variant="outline"
                size="icon"
                className="bg-transparent hover:bg-destructive/10 border-destructive text-destructive hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sair</span>
              </Button>
            </form>
          )}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 p-4">
                <Link href="/dashboard" className="flex items-center gap-2 mb-4" onClick={() => setIsSheetOpen(false)}>
                  <Image src="/logo-afps.png" alt="AFPS Logo" width={30} height={30} />
                  <span className="font-bold text-lg">AFPS</span>
                </Link>
                {filteredLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={`block py-2 text-lg transition-colors hover:text-primary ${
                      pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {session && (
                  <form action={logoutAction} className="mt-auto">
                    <Button
                      variant="outline"
                      className="w-full text-destructive border-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-5 w-5" /> Sair
                    </Button>
                  </form>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
