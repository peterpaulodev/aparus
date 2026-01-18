'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Schema de validação
const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, 'ID do agendamento é obrigatório'),
  status: z.enum(['CONFIRMED', 'PENDING', 'CANCELED', 'COMPLETED'], {
    message: 'Status inválido',
  }),
});

type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

type UpdateBookingStatusResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action: Atualizar o status de um agendamento
 */
export async function updateBookingStatus(
  input: UpdateBookingStatusInput
): Promise<UpdateBookingStatusResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para atualizar agendamentos',
      };
    }

    // 2. Validar input com Zod
    const validationResult = updateBookingStatusSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    const { bookingId, status } = validationResult.data;

    // 3. Buscar o agendamento e verificar se pertence à barbearia do utilizador
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        barbershop: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: 'Agendamento não encontrado',
      };
    }

    if (booking.barbershop.ownerId !== session.user.id) {
      return {
        success: false,
        error: 'Você não tem permissão para atualizar este agendamento',
      };
    }

    // 4. Atualizar o status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // 5. Revalidar caches
    revalidatePath('/admin');
    revalidatePath('/admin/bookings');
    revalidatePath(`/${booking.barbershop.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    return {
      success: false,
      error: 'Erro ao atualizar o agendamento. Tente novamente.',
    };
  }
}
