"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// O Schema deve bater com o do formulário
const updateBarbershopSchema = z.object({
  id: z.string().uuid(), // Precisamos do ID para saber qual atualizar
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
})

type UpdateBarbershopParams = z.infer<typeof updateBarbershopSchema>

export async function updateBarbershop(params: UpdateBarbershopParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Validação extra: Verificar se o user é mesmo dono desta barbearia
  const userBarbershop = await prisma.barbershop.findUnique({
    where: {
      id: params.id,
      ownerId: session.user.id, // Garante segurança
    }
  })

  if (!userBarbershop) {
    throw new Error("Barbearia não encontrada ou sem permissão.")
  }

  await prisma.barbershop.update({
    where: {
      id: params.id,
    },
    data: {
      name: params.name,
      address: params.address,
      phone: params.phone,
      logoUrl: params.logoUrl,
      bannerUrl: params.bannerUrl,
    },
  })

  revalidatePath("/admin/settings")
  revalidatePath("/") // Revalida a home se necessário
  revalidatePath(`/${userBarbershop.slug}`) // Revalida a página pública
}