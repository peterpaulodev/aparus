'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Schema de validação
const createBarbershopSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres'),
  slug: z
    .string()
    .min(2, 'O link deve ter pelo menos 2 caracteres')
    .max(50, 'O link não pode exceder 50 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'O link deve conter apenas letras minúsculas, números e hífens'
    ),
});

type CreateBarbershopInput = z.infer<typeof createBarbershopSchema>;

type CreateBarbershopResult =
  | { success: true; barbershopId: string; slug: string }
  | { success: false; error: string; field?: string };

export async function createBarbershop(
  input: CreateBarbershopInput
): Promise<CreateBarbershopResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para criar uma barbearia',
      };
    }

    // 2. Validar input com Zod
    const validationResult = createBarbershopSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path[0]?.toString(),
      };
    }

    const { name, slug } = validationResult.data;

    // 3. Verificar se o slug já existe
    const existingBarbershop = await prisma.barbershop.findUnique({
      where: { slug },
    });

    if (existingBarbershop) {
      return {
        success: false,
        error: 'Este link já está em uso. Escolha outro.',
        field: 'slug',
      };
    }

    // 4 e 5. Criar a Barbershop com serviços padrão
    const barbershop = await prisma.barbershop.create({
      data: {
        name,
        slug,
        ownerId: session.user.id,
        // Criar serviços padrão automaticamente
        services: {
          create: [
            {
              name: 'Corte de Cabelo',
              price: 35.0,
              duration: 30,
              description: 'Corte tradicional com máquina e tesoura',
            },
            {
              name: 'Barba',
              price: 25.0,
              duration: 20,
              description: 'Aparar e modelar a barba',
            },
            {
              name: 'Corte + Barba',
              price: 50.0,
              duration: 45,
              description: 'Combo completo: corte de cabelo e barba',
            },
          ],
        },
      },
    });

    // 6. Revalidar o cache da página admin
    revalidatePath('/admin');

    return {
      success: true,
      barbershopId: barbershop.id,
      slug: barbershop.slug,
    };
  } catch (error) {
    console.error('Erro ao criar barbearia:', error);
    return {
      success: false,
      error: 'Erro ao criar a barbearia. Tente novamente.',
    };
  }
}
