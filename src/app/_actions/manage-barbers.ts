'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { extractFileKey, utapi } from '@/lib/uploadthing';

// Schema de validação para upsert
const upsertBarberSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres'),
  description: z
    .string()
    .max(500, 'A descrição não pode exceder 500 caracteres')
    .optional(),
  avatarUrl: z.string().optional(),
});

// Schema de validação para delete
const deleteBarberSchema = z.object({
  id: z.string().min(1, 'ID do barbeiro é obrigatório'),
});

type UpsertBarberInput = z.infer<typeof upsertBarberSchema>;
type DeleteBarberInput = z.infer<typeof deleteBarberSchema>;

type BarberResult =
  | { success: true; barberId: string }
  | { success: false; error: string; field?: string };

type DeleteResult =
  | { success: true }
  | { success: false; error: string };

// Disponibilidade padrão: Segunda a Sexta, 09:00 às 18:00
const DEFAULT_AVAILABILITY = {
  monday: { available: true, start: '09:00', end: '18:00' },
  tuesday: { available: true, start: '09:00', end: '18:00' },
  wednesday: { available: true, start: '09:00', end: '18:00' },
  thursday: { available: true, start: '09:00', end: '18:00' },
  friday: { available: true, start: '09:00', end: '18:00' },
  saturday: { available: false, start: '09:00', end: '18:00' },
  sunday: { available: false, start: '09:00', end: '18:00' },
};

/**
 * Server Action: Criar ou atualizar um barbeiro
 */
export async function upsertBarber(
  input: UpsertBarberInput
): Promise<BarberResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para gerenciar barbeiros',
      };
    }

    // 2. Validar input com Zod
    const validationResult = upsertBarberSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path[0]?.toString(),
      };
    }

    const { id, name, description, avatarUrl } = validationResult.data;

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
      // Verificar se o barbeiro existe e pertence a esta barbearia
      const existingBarber = await prisma.barber.findUnique({
        where: { id },
      });

      if (!existingBarber) {
        return {
          success: false,
          error: 'Barbeiro não encontrado',
        };
      }

      if (existingBarber.barbershopId !== barbershop.id) {
        return {
          success: false,
          error: 'Você não tem permissão para editar este barbeiro',
        };
      }

      if (
        avatarUrl &&
        existingBarber.avatarUrl &&
        avatarUrl !== existingBarber.avatarUrl
      ) {
        const key = extractFileKey(existingBarber.avatarUrl)
        if (key) {
          await utapi.deleteFiles(key)
          console.log(`🗑️ Avatar antigo deletado: ${key}`)
        }
      }

      // Atualizar barbeiro existente
      const updatedBarber = await prisma.barber.update({
        where: { id },
        data: {
          name,
          description,
          avatarUrl
        },
      });

      revalidatePath('/admin/barbers');
      revalidatePath('/admin');
      revalidatePath(`/${barbershop.slug}`);

      return {
        success: true,
        barberId: updatedBarber.id,
      };
    } else {
      // Criar novo barbeiro com availability padrão
      const newBarber = await prisma.barber.create({
        data: {
          name,
          description,
          barbershopId: barbershop.id,
          availability: DEFAULT_AVAILABILITY,
          avatarUrl
        },
      });

      revalidatePath('/admin/barbers');
      revalidatePath('/admin');
      revalidatePath(`/${barbershop.slug}`);

      return {
        success: true,
        barberId: newBarber.id,
      };
    }
  } catch (error) {
    console.error('Erro ao salvar barbeiro:', error);
    return {
      success: false,
      error: 'Erro ao salvar o barbeiro. Tente novamente.',
    };
  }
}

/**
 * Server Action: Deletar um barbeiro
 */
export async function deleteBarber(
  input: DeleteBarberInput
): Promise<DeleteResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para gerenciar barbeiros',
      };
    }

    // 2. Validar input com Zod
    const validationResult = deleteBarberSchema.safeParse(input);

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

    // 4. Verificar se o barbeiro existe e pertence a esta barbearia
    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!barber) {
      return {
        success: false,
        error: 'Barbeiro não encontrado',
      };
    }

    if (barber.barbershopId !== barbershop.id) {
      return {
        success: false,
        error: 'Você não tem permissão para deletar este barbeiro',
      };
    }

    // 5. Verificar se existem agendamentos associados
    if (barber._count.bookings > 0) {
      return {
        success: false,
        error:
          'Não é possível deletar este barbeiro porque ele possui agendamentos associados',
      };
    }

    // 6. Deletar o barbeiro
    await prisma.barber.delete({
      where: { id },
    });

    // 7. Deletar avatar do barbeiro se existir
    if (barber.avatarUrl) {
      const key = extractFileKey(barber.avatarUrl)
      if (key) {
        await utapi.deleteFiles(key)
        console.log(`🗑️ Avatar deletado: ${key}`)
      }
    }

    revalidatePath('/admin/barbers');
    revalidatePath('/admin');
    revalidatePath(`/${barbershop.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao deletar barbeiro:', error);
    return {
      success: false,
      error: 'Erro ao deletar o barbeiro. Tente novamente.',
    };
  }
}

// Schema de validação para availability
const dayAvailabilitySchema = z.object({
  monday: z.array(z.string()).optional(),
  tuesday: z.array(z.string()).optional(),
  wednesday: z.array(z.string()).optional(),
  thursday: z.array(z.string()).optional(),
  friday: z.array(z.string()).optional(),
  saturday: z.array(z.string()).optional(),
  sunday: z.array(z.string()).optional(),
});

const updateBarberAvailabilitySchema = z.object({
  barberId: z.string().min(1, 'ID do barbeiro é obrigatório'),
  availability: dayAvailabilitySchema,
});

type UpdateBarberAvailabilityInput = z.infer<typeof updateBarberAvailabilitySchema>;

/**
 * Server Action: Atualizar disponibilidade de um barbeiro
 */
export async function updateBarberAvailability(
  input: UpdateBarberAvailabilityInput
): Promise<DeleteResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para gerenciar barbeiros',
      };
    }

    // 2. Validar input com Zod
    const validationResult = updateBarberAvailabilitySchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    const { barberId, availability } = validationResult.data;

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

    // 4. Verificar se o barbeiro existe e pertence a esta barbearia
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      return {
        success: false,
        error: 'Barbeiro não encontrado',
      };
    }

    if (barber.barbershopId !== barbershop.id) {
      return {
        success: false,
        error: 'Você não tem permissão para editar a disponibilidade deste barbeiro',
      };
    }

    // 5. Atualizar a disponibilidade do barbeiro
    await prisma.barber.update({
      where: { id: barberId },
      data: {
        availability: availability,
      },
    });

    revalidatePath('/admin/barbers');
    revalidatePath('/admin');
    revalidatePath(`/${barbershop.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade do barbeiro:', error);
    return {
      success: false,
      error: 'Erro ao atualizar a disponibilidade. Tente novamente.',
    };
  }
}
