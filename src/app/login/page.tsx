"use client"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Button onClick={() => signIn("google", { callbackUrl: "/admin" })}>
        Entrar com Google
      </Button>
    </div>
  )
}