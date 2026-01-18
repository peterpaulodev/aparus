'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, Menu, Settings, TrendingUp, UserCircle } from 'lucide-react';

import { Logo } from '@/assets/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/admin/user-nav';

interface AdminHeaderProps {
  /**
   * Exibir o logo no header (somente na página principal do admin)
   */
  showLogo?: boolean;

  /**
   * Exibir botões de navegação no desktop (somente na página principal do admin)
   */
  showNavigation?: boolean;

  /**
   * Título da página (para páginas internas)
   */
  title?: string;

  /**
   * Subtítulo opcional (abaixo do título)
   */
  subtitle?: string;

  /**
   * Ações adicionais no canto direito (ex: CreateBookingDialog)
   */
  actions?: React.ReactNode;

  /**
   * Dados da barbearia (para renderização condicional de navegação)
   */
  barbershop?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  } | null;

  /**
   * Dados do utilizador logado
   */
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface NavigationLink {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  show?: boolean;
}

export function AdminHeader({
  showLogo = false,
  showNavigation = false,
  title,
  subtitle,
  actions,
  barbershop,
  user,
}: AdminHeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const navigationLinks: NavigationLink[] = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: TrendingUp,
      show: true,
    },
    {
      href: '/admin/services',
      label: 'Gerir Serviços',
      icon: Settings,
      show: true,
    },
    {
      href: '/admin/barbers',
      label: 'Minha Equipe',
      icon: UserCircle,
      show: true,
    },
    {
      href: '/admin/bookings',
      label: 'Agendamentos',
      icon: Calendar,
      show: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Side: Logo ou Título */}
        <div className="flex items-center gap-4">
          {/* Menu Hamburguer (Mobile) */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  {/* <Logo width={70} height={70} color="#ffffff" lineColor="#000000" /> */}
                  <span>Menu</span>
                </SheetTitle>
              </SheetHeader>

              {/* Navegação Mobile */}
              <nav className="flex flex-col gap-2 px-3">
                {navigationLinks
                  .filter((link) => link.show)
                  .map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
              </nav>

              <Separator className="my-6" />

              {/* Informação da Barbearia */}
              {barbershop && (
                <div className="rounded-lg bg-muted p-3 mx-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={barbershop.logoUrl || undefined} alt={barbershop.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {barbershop.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Barbearia Ativa</p>
                      <p className="mt-0.5 text-sm font-semibold truncate">{barbershop.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Logo (Desktop - somente no dashboard) */}
          {showLogo && (
            <Link href="/admin" className="">
              <Logo width={110} height={110} color="#ffffff" lineColor="#000000" />
            </Link>
          )}

          {/* Título (páginas internas) */}
          {title && !showLogo && (
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Navegação Desktop + Ações + UserNav */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Botões de Navegação (Desktop - somente no dashboard) */}
          {showNavigation && barbershop && (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/services">
                  <Settings className="mr-2 h-4 w-4" />
                  Gerir Serviços
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/barbers">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Minha Equipe
                </Link>
              </Button>
            </div>
          )}

          {/* Ações Customizadas (ex: CreateBookingDialog) */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {/* User Navigation */}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
