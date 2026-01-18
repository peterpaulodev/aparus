'use server';

import { prisma } from '@/lib/prisma';
import { format, parse, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

interface GetAvailableTimesParams {
  barberId: string;
  date: Date;
  serviceDuration: number; // em minutos
}

interface GetAvailableTimesResult {
  success: boolean;
  times?: string[];
  error?: string;
}

// Mapeamento de dias da semana (getDay() retorna 0-6)
const DAY_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

// Tipos para suportar ambos os formatos de availability
type DayAvailabilityFormatA = string[]; // ["09:00", "09:45", "10:30"]

type DayAvailabilityFormatB = {
  available: boolean;
  start: string;
  end: string;
};

type BarberAvailability = Record<string, DayAvailabilityFormatA | DayAvailabilityFormatB>;

/**
 * Verifica se é formato A (array de strings)
 */
function isFormatA(config: unknown): config is string[] {
  return Array.isArray(config);
}

/**
 * Verifica se é formato B (objeto com start/end)
 */
function isFormatB(config: unknown): config is DayAvailabilityFormatB {
  return Boolean(config && typeof config === 'object' && 'start' in config && 'end' in config);
}

/**
 * Busca os horários disponíveis de um barbeiro em uma data específica
 */
export async function getAvailableTimes({
  barberId,
  date,
  serviceDuration,
}: GetAvailableTimesParams): Promise<GetAvailableTimesResult> {
  try {
    // 1. Buscar o barbeiro com sua disponibilidade
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        name: true,
        availability: true
      },
    });

    if (!barber) {
      return { success: false, error: 'Barbeiro não encontrado' };
    }

    // 2. Verificar se o barbeiro tem availability configurado
    if (!barber.availability) {
      return { success: false, error: 'Disponibilidade não configurada para este barbeiro' };
    }

    // 3. Obter o dia da semana da data selecionada
    const dayOfWeek = DAY_MAP[date.getDay()];
    const availability = barber.availability as BarberAvailability;
    const dayConfig = availability[dayOfWeek];

    // 4. Verificar se o barbeiro tem configuração para este dia
    if (!dayConfig) {
      return {
        success: true,
        times: [],
      };
    }

    let allPossibleTimes: Date[] = [];

    // 5A. FORMATO A: Array de horários predefinidos
    if (isFormatA(dayConfig)) {
      // Se array vazio, barbeiro não trabalha neste dia
      if (dayConfig.length === 0) {
        return {
          success: true,
          times: [],
        };
      }

      // Converter strings de horário para Date objects
      allPossibleTimes = dayConfig
        .map((timeStr) => {
          try {
            return parse(timeStr, 'HH:mm', date);
          } catch {
            return null;
          }
        })
        .filter((d): d is Date => d !== null);
    }
    // 5B. FORMATO B: Intervalo start/end
    else if (isFormatB(dayConfig)) {
      // Verificar se o barbeiro trabalha neste dia
      if (!dayConfig.available) {
        return {
          success: true,
          times: [],
        };
      }

      // Gerar todos os horários possíveis baseado no intervalo de trabalho
      const workStart = parse(dayConfig.start, 'HH:mm', date);
      const workEnd = parse(dayConfig.end, 'HH:mm', date);

      let currentTime = workStart;

      // Gerar slots baseados na duração do serviço
      while (isBefore(currentTime, workEnd) || currentTime.getTime() === workEnd.getTime()) {
        // Verificar se o slot completo cabe no horário de trabalho
        const slotEnd = addMinutes(currentTime, serviceDuration);
        if (isAfter(slotEnd, workEnd)) {
          break; // Não cabe mais nenhum slot completo
        }

        allPossibleTimes.push(new Date(currentTime));
        currentTime = addMinutes(currentTime, serviceDuration);
      }
    } else {
      // Formato desconhecido
      return {
        success: false,
        error: 'Formato de disponibilidade não reconhecido',
      };
    }

    // 6. Buscar bookings existentes do barbeiro nesta data
    const existingBookings = await prisma.booking.findMany({
      where: {
        barberId,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
        status: {
          in: ['CONFIRMED', 'PENDING'], // Não considerar CANCELLED
        },
      },
      include: {
        service: {
          select: { duration: true },
        },
      },
    });

    // 7. Filtrar horários que conflitam com bookings existentes
    const availableTimes = allPossibleTimes.filter((slotStart) => {
      const slotEnd = addMinutes(slotStart, serviceDuration);

      // Verificar se há conflito com algum booking existente
      const hasConflict = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.date);
        const bookingEnd = addMinutes(bookingStart, booking.service.duration);

        // Há conflito se:
        // - O slot começa durante um booking existente, ou
        // - O slot termina durante um booking existente, ou
        // - O slot engloba completamente um booking existente
        return (
          (isAfter(slotStart, bookingStart) && isBefore(slotStart, bookingEnd)) || // Começa durante
          (isAfter(slotEnd, bookingStart) && isBefore(slotEnd, bookingEnd)) ||     // Termina durante
          (isBefore(slotStart, bookingStart) && isAfter(slotEnd, bookingEnd)) ||   // Engloba
          slotStart.getTime() === bookingStart.getTime()                            // Exatamente no mesmo horário
        );
      });

      return !hasConflict;
    });

    // 8. Converter para strings no formato "HH:mm"
    const availableTimeStrings = availableTimes.map((time) => format(time, 'HH:mm'));

    return {
      success: true,
      times: availableTimeStrings,
    };
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    return {
      success: false,
      error: 'Erro ao buscar horários disponíveis',
    };
  }
}
