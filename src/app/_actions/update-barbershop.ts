"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { extractFileKey, utapi } from "@/lib/uploadthing"

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

  const userBarbershop = await prisma.barbershop.findUnique({
    where: {
      id: params.id,
      ownerId: session.user.id,
    }
  })

  if (!userBarbershop) {
    throw new Error("Barbearia não encontrada ou sem permissão.")
  }

  if (
    params.logoUrl &&
    userBarbershop.logoUrl &&
    params.logoUrl !== userBarbershop.logoUrl
  ) {
    const key = extractFileKey(userBarbershop.logoUrl)
    if (key) {
      await utapi.deleteFiles(key)
      console.log(`🗑️ Logo antigo deletado: ${key}`)
    }
  }

  if (
    params.bannerUrl &&
    userBarbershop.bannerUrl &&
    params.bannerUrl !== userBarbershop.bannerUrl
  ) {
    const key = extractFileKey(userBarbershop.bannerUrl)
    if (key) {
      await utapi.deleteFiles(key)
      console.log(`🗑️ Banner antigo deletado: ${key}`)
    }
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