'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Schema de validação para upsert
const upsertServiceSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres'),
  price: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num < 0) {
        throw new Error('Preço inválido');
      }
      return num;
    })
    .refine((val) => val >= 0, 'O preço deve ser maior ou igual a zero'),
  duration: z
    .number()
    .int('A duração deve ser um número inteiro')
    .min(1, 'A duração deve ser de pelo menos 1 minuto')
    .max(480, 'A duração não pode exceder 8 horas'),
  description: z
    .string()
    .max(500, 'A descrição não pode exceder 500 caracteres')
    .optional(),
});

// Schema de validação para delete
const deleteServiceSchema = z.object({
  id: z.string().min(1, 'ID do serviço é obrigatório'),
});

type UpsertServiceInput = z.infer<typeof upsertServiceSchema>;
type DeleteServiceInput = z.infer<typeof deleteServiceSchema>;

type ServiceResult =
  | { success: true; serviceId: string }
  | { success: false; error: string; field?: string };

type DeleteResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action: Criar ou atualizar um serviço
 */
export async function upsertService(
  input: UpsertServiceInput
): Promise<ServiceResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para gerenciar serviços',
      };
    }

    // 2. Validar input com Zod
    const validationResult = upsertServiceSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path[0]?.toString(),
      };
    }

    const { id, name, price, duration, description } = validationResult.data;

    // 3. Buscar a barbearia do utilizador
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!barbershop) {
      return {
        success: false,
        error: 'Você não tem uma barbearia cadastrada',
      };
    }

    // 4. Se tiver ID, atualizar; caso contrário, criar
    if (id) {
      // Verificar se o serviço existe e pertence a esta barbearia
      const existingService = await prisma.service.findUnique({
        where: { id },
      });

      if (!existingService) {
        return {
          success: false,
          error: 'Serviço não encontrado',
        };
      }

      if (existingService.barbershopId !== barbershop.id) {
        return {
          success: false,
          error: 'Você não tem permissão para editar este serviço',
        };
      }

      // Atualizar serviço existente
      const updatedService = await prisma.service.update({
        where: { id },
        data: {
          name,
          price,
          duration,
          description,
        },
      });

      revalidatePath('/admin/services');
      revalidatePath('/admin');
      revalidatePath(`/${barbershop.slug}`);

      return {
        success: true,
        serviceId: updatedService.id,
      };
    } else {
      // Criar novo serviço
      const newService = await prisma.service.create({
        data: {
          name,
          price,
          duration,
          description,
          barbershopId: barbershop.id,
        },
      });

      revalidatePath('/admin/services');
      revalidatePath('/admin');
      revalidatePath(`/${barbershop.slug}`);

      return {
        success: true,
        serviceId: newService.id,
      };
    }
  } catch (error) {
    console.error('Erro ao salvar serviço:', error);
    return {
      success: false,
      error: 'Erro ao salvar o serviço. Tente novamente.',
    };
  }
}

/**
 * Server Action: Deletar um serviço
 */
export async function deleteService(
  input: DeleteServiceInput
): Promise<DeleteResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para gerenciar serviços',
      };
    }

    // 2. Validar input com Zod
    const validationResult = deleteServiceSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    const { id } = validationResult.data;

    // 3. Buscar a barbearia do utilizador
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!barbershop) {
      return {
        success: false,
        error: 'Você não tem uma barbearia cadastrada',
      };
    }

    // 4. Verificar se o serviço existe e pertence a esta barbearia
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!service) {
      return {
        success: false,
        error: 'Serviço não encontrado',
      };
    }

    if (service.barbershopId !== barbershop.id) {
      return {
        success: false,
        error: 'Você não tem permissão para deletar este serviço',
      };
    }

    // 5. Verificar se existem agendamentos associados
    if (service._count.bookings > 0) {
      return {
        success: false,
        error:
          'Não é possível deletar este serviço porque ele possui agendamentos associados',
      };
    }

    // 6. Deletar o serviço
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath('/admin/services');
    revalidatePath('/admin');
    revalidatePath(`/${barbershop.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    return {
      success: false,
      error: 'Erro ao deletar o serviço. Tente novamente.',
    };
  }
}
