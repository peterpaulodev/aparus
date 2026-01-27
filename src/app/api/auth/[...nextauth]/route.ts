import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { DefaultSession } from "next-auth"

const prisma = new PrismaClient()

// Extender os tipos do NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      barbershopId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    barbershopId?: string | null
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Isto é magia: adiciona o ID do usuário e da Barbearia à sessão
      // Assim não precisas de buscar no banco toda a hora
      if (session.user) {
        session.user.id = user.id;
        session.user.barbershopId = user.barbershopId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Forçar redirecionamento para /admin após login bem-sucedido
      // Ignorar URL de origem para garantir que sempre vai para admin
      
      // Se o callbackUrl for explicitamente /admin, usar esse
      if (url.includes('/admin')) {
        return `${baseUrl}/admin`;
      }
      
      // Para qualquer outro caso após autenticação, redirecionar para /admin
      return `${baseUrl}/admin`;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }