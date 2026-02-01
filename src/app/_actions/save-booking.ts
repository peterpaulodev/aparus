'use server';

import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { getAvailableTimes } from './get-available-times';

type SaveBookingParams = {
  barbershopId: string;
  serviceId: string;
  barberId: string;
  date: Date;
  customerName: string;
  customerPhone: string;
};

type SaveBookingResult = { success: true | false; bookingId?: string; error?: string };

export async function saveBooking(
  params: SaveBookingParams
): Promise<SaveBookingResult> {
  try {
    const {
      barbershopId,
      serviceId,
      barberId,
      date,
      customerName,
      customerPhone,
    } = params;

    // Validações básicas
    if (!barbershopId || !serviceId || !barberId) {
      return {
        success: false,
        error: 'Dados do agendamento incompletos',
      };
    }

    if (!customerName || !customerPhone) {
      return {
        success: false,
        error: 'Nome e telefone são obrigatórios',
      };
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return {
        success: false,
        error: 'Data inválida',
      };
    }

    // Verifica se a data não está no passado
    if (date < new Date()) {
      return {
        success: false,
        error: 'Não é possível agendar para datas passadas',
      };
    }

    // Normaliza o telefone (remove espaços e caracteres especiais)
    const normalizedPhone = customerPhone.replace(/\D/g, '');

    // Busca o serviço para obter a duração
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    });

    if (!service) {
      return {
        success: false,
        error: 'Serviço não encontrado',
      };
    }

    // Valida se o horário está disponível
    const availabilityCheck = await getAvailableTimes({
      barberId,
      date,
      serviceDuration: service.duration,
    });

    if (!availabilityCheck.success || !availabilityCheck.times) {
      return {
        success: false,
        error: availabilityCheck.error || 'Erro ao verificar disponibilidade',
      };
    }

    const requestedTime = format(date, 'HH:mm');
    if (!availabilityCheck.times.includes(requestedTime)) {
      return {
        success: false,
        error: 'Este horário não está mais disponível. Por favor, escolha outro horário.',
      };
    }

    // Verifica se já existe um Customer com esse telefone na barbearia
    let customer = await prisma.customer.findFirst({
      where: {
        phone: normalizedPhone,
        barbershopId,
      },
    });

    // Se não existir, cria um novo Customer
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: normalizedPhone,
          barbershopId,
        },
      });
    }

    // Verifica se já existe um agendamento no mesmo horário para o barbeiro
    const existingBooking = await prisma.booking.findFirst({
      where: {
        barberId,
        date,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingBooking) {
      return {
        success: false,
        error: 'Este horário já está reservado. Por favor, escolha outro horário.',
      };
    }

    // Cria o Booking
    const booking = await prisma.booking.create({
      data: {
        date,
        status: 'CONFIRMED',
        barbershopId,
        barberId,
        serviceId,
        customerId: customer.id,
      },
      include: {
        service: true,
        barber: true,
        customer: true,
      },
    });

    // Revalida o cache da página da barbearia
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { slug: true },
    });

    if (barbershop) {
      revalidatePath(`/${barbershop.slug}`);
    }

    return {
      success: true,
      bookingId: booking.id,
    };
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error);
    return {
      success: false,
      error: 'Erro ao processar o agendamento. Tente novamente.',
    };
  }
}
