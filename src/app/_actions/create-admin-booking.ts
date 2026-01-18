'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Schema de validação
const createAdminBookingSchema = z.object({
  customerId: z.string().optional(),
  newCustomerName: z.string().optional(),
  newCustomerPhone: z.string().optional(),
  serviceId: z.string().min(1, 'Serviço é obrigatório'),
  barberId: z.string().min(1, 'Barbeiro é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
});

type CreateAdminBookingInput = z.infer<typeof createAdminBookingSchema>;

type CreateAdminBookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

/**
 * Server Action: Criar agendamento pelo admin
 */
export async function createAdminBooking(
  input: CreateAdminBookingInput
): Promise<CreateAdminBookingResult> {
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Você precisa estar autenticado',
      };
    }

    // 2. Validar input com Zod
    const validationResult = createAdminBookingSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    const { customerId, newCustomerName, newCustomerPhone, serviceId, barberId, date, time } =
      validationResult.data;

    // 3. Buscar barbearia do usuário
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!barbershop) {
      return {
        success: false,
        error: 'Barbearia não encontrada',
      };
    }

    // 4. Verificar se serviço e barbeiro pertencem à barbearia
    const [service, barber] = await Promise.all([
      prisma.service.findFirst({
        where: { id: serviceId, barbershopId: barbershop.id },
      }),
      prisma.barber.findFirst({
        where: { id: barberId, barbershopId: barbershop.id },
      }),
    ]);

    if (!service || !barber) {
      return {
        success: false,
        error: 'Serviço ou barbeiro não encontrado',
      };
    }

    // 5. Determinar ou criar o cliente
    let finalCustomerId: string;

    if (customerId) {
      // Verificar se o cliente pertence à barbearia
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, barbershopId: barbershop.id },
      });

      if (!customer) {
        return {
          success: false,
          error: 'Cliente não encontrado',
        };
      }

      finalCustomerId = customerId;
    } else {
      // Criar novo cliente
      if (!newCustomerName || !newCustomerPhone) {
        return {
          success: false,
          error: 'Nome e telefone do cliente são obrigatórios',
        };
      }

      const normalizedPhone = newCustomerPhone.replace(/\D/g, '');

      // Verificar se já existe cliente com esse telefone
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          phone: normalizedPhone,
          barbershopId: barbershop.id,
        },
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            name: newCustomerName,
            phone: normalizedPhone,
            barbershopId: barbershop.id,
          },
        });

        finalCustomerId = newCustomer.id;
      }
    }

    // 6. Criar a data completa do agendamento
    const bookingDate = new Date(`${date}T${time}`);

    // 7. Verificar se já existe agendamento no mesmo horário
    const existingBooking = await prisma.booking.findFirst({
      where: {
        barberId,
        date: bookingDate,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingBooking) {
      return {
        success: false,
        error: 'Este horário já está reservado',
      };
    }

    // 8. Criar o agendamento
    const booking = await prisma.booking.create({
      data: {
        date: bookingDate,
        status: 'CONFIRMED',
        barbershopId: barbershop.id,
        barberId,
        serviceId,
        customerId: finalCustomerId,
      },
    });

    // 9. Revalidar caches
    revalidatePath('/admin');
    revalidatePath('/admin/bookings');
    revalidatePath(`/${barbershop.slug}`);

    return {
      success: true,
      bookingId: booking.id,
    };
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return {
      success: false,
      error: 'Erro ao criar o agendamento. Tente novamente.',
    };
  }
}
