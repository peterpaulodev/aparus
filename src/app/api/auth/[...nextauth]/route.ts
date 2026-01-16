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
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }