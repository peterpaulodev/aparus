"use client"

import Link from "next/link"
import { Calendar, LogIn, LogOut, User } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"

import { Logo } from "@/assets/logo" // O teu logo SVG
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PublicHeader() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LADO ESQUERDO: Branding Discreto do SaaS */}
        <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          {/* Usa uma versão pequena/monocromática do logo se possível, ou o normal reduzido */}
          <div className="bg-background/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 shadow-sm">
            <Logo width={24} height={24} color="#ffffff" lineColor="#000000" />
          </div>
          {/* Opcional: Texto "Aparus" apenas em desktop */}
          <span className="hidden md:inline-block font-semibold text-sm text-foreground/80 backdrop-blur-md bg-background/30 px-2 py-0.5 rounded-md">
            Aparus
          </span>
        </Link>

        {/* LADO DIREITO: User Menu (Para ver agendamentos) */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-white/10 bg-background/20 backdrop-blur-sm hover:bg-background/40">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
                    <AvatarFallback>{session.user.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    Meus Agendamentos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="bg-background/20 backdrop-blur-md hover:bg-background/40 border border-white/10 text-foreground font-medium shadow-sm"
              onClick={() => signIn("google")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}