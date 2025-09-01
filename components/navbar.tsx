'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, LogOut, Moon, Sun } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { logoutAction } from '@/app/login/actions';
import { useTheme } from 'next-themes';
import type { SessionData } from '@/types/player-interfaces';
import { ROLES } from '@/lib/roles';

export default function Navbar({ session }: { session: SessionData | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks: {
    href: string;
    label: string;
    roles?: (typeof ROLES)[keyof typeof ROLES][];
  }[] = [
    { href: '/dashboard', label: 'Dashboard' },
    {
      href: '/partidas',
      label: 'Partidas',
      roles: [ROLES.ADMIN, ROLES.JOGADOR, ROLES.ARBITRO, ROLES.COMISSAO],
    },
    {
      href: `/jogadores/${session?.cpf}`,
      label: 'Meu Perfil',
      roles: [ROLES.ADMIN, ROLES.JOGADOR],
    },
    { href: '/admin', label: 'Gerenciamento', roles: [ROLES.ADMIN] },
    { href: '/admin/despesas', label: 'Despesas', roles: [ROLES.ADMIN] },
    {
      href: '/transparencia',
      label: 'Transparência',
      roles: [ROLES.JOGADOR, ROLES.ADMIN],
    },
  ];

  const filteredLinks = navLinks.filter((link) => {
    if (!session) return !link.roles;
    return !link.roles || link.roles.includes(session.role);
  });

  const isHomePage = pathname === '/';
  const isLoginPage = pathname === '/login';

  if (isLoginPage) return null;

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsSheetOpen(false);
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-20 items-center justify-between max-w-7xl px-4 md:px-6'>
        <button
          onClick={() => handleNavigation(session ? '/dashboard' : '/')}
          className='flex items-center gap-2'
        >
          <Image src='/logo-afps.png' alt='AFPS Logo' width={40} height={40} />
          <span className='font-bold text-xl text-primary'>AFPS</span>
        </button>

        {session ? (
          <nav className='hidden md:flex items-center gap-6 text-lg font-medium'>
            {filteredLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavigation(link.href)}
                className={`transition-colors hover:text-primary ${
                  pathname === link.href
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        ) : (
          <nav className='hidden md:flex items-center gap-6 text-lg font-medium'>
            <Button
              variant='default'
              onClick={() => handleNavigation('/login')}
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              Acessar Sistema
            </Button>
          </nav>
        )}

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
          </Button>
          {session && (
            <form action={logoutAction} className='hidden md:block'>
              <Button
                variant='outline'
                size='icon'
                className='bg-transparent hover:bg-destructive/10 border-destructive text-destructive hover:text-destructive'
              >
                <LogOut className='h-5 w-5' />
                <span className='sr-only'>Sair</span>
              </Button>
            </form>
          )}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <Button variant='outline' size='icon'>
                <MenuIcon className='h-6 w-6' />
                <span className='sr-only'>Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='right'>
              <div className='flex flex-col gap-4 p-4'>
                <button
                  onClick={() => handleNavigation(session ? '/dashboard' : '/')}
                  className='flex items-center gap-2 mb-4'
                >
                  <Image
                    src='/logo-afps.png'
                    alt='AFPS Logo'
                    width={30}
                    height={30}
                  />
                  <span className='font-bold text-lg'>AFPS</span>
                </button>
                {session ? (
                  <>
                    {filteredLinks.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => handleNavigation(link.href)}
                        className={`block py-2 text-lg transition-colors hover:text-primary ${
                          pathname === link.href
                            ? 'text-primary font-semibold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                    <form action={logoutAction} className='mt-auto'>
                      <Button
                        variant='outline'
                        className='w-full text-destructive border-destructive hover:bg-destructive/10 bg-transparent'
                      >
                        <LogOut className='mr-2 h-5 w-5' /> Sair
                      </Button>
                    </form>
                  </>
                ) : (
                  <Button
                    variant='default'
                    onClick={() => handleNavigation('/login')}
                    className='w-full bg-primary hover:bg-primary/90 text-primary-foreground'
                  >
                    Acessar Sistema
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
