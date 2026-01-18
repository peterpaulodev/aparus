'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type DailyRevenue = {
  date: string;
  revenue: number;
};

type DashboardMetrics = {
  todayRevenue: number;
  monthRevenue: number;
  totalBookings: number;
  dailyRevenueChart: DailyRevenue[];
};

type Result =
  | { success: true; metrics: DashboardMetrics }
  | { success: false; error: string };

/**
 * Calcula as métricas financeiras da barbearia do utilizador logado
 *
 * @param chartDays - Número de dias para o gráfico de receitas diárias (default: 7)
 * @returns Métricas do dashboard ou erro
 */
export async function getDashboardMetrics(chartDays = 7): Promise<Result> {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: 'Autenticação necessária' };
    }

    // Buscar barbearia do utilizador
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!barbershop) {
      return { success: false, error: 'Barbearia não encontrada' };
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const chartStart = startOfDay(subDays(now, chartDays - 1));

    // Buscar agendamentos de hoje com status COMPLETED
    const todayCompletedBookings = await prisma.booking.findMany({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
    });

    // Calcular receita de hoje
    const todayRevenue = todayCompletedBookings.reduce((total, booking) => {
      return total + Number(booking.service.price);
    }, 0);

    // Buscar agendamentos do mês com status COMPLETED
    const monthCompletedBookings = await prisma.booking.findMany({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
    });

    // Calcular receita do mês
    const monthRevenue = monthCompletedBookings.reduce((total, booking) => {
      return total + Number(booking.service.price);
    }, 0);

    // Contar total de agendamentos do mês (qualquer status)
    const totalBookings = await prisma.booking.count({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Buscar agendamentos dos últimos N dias para o gráfico
    const chartBookings = await prisma.booking.findMany({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: chartStart,
          lte: todayEnd,
        },
        status: 'COMPLETED',
      },
      include: {
        service: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Agrupar receitas por dia
    const revenueByDay = new Map<string, number>();

    // Inicializar todos os dias com 0
    for (let i = 0; i < chartDays; i++) {
      const date = subDays(now, chartDays - 1 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      revenueByDay.set(dateKey, 0);
    }

    // Somar receitas por dia
    chartBookings.forEach((booking) => {
      const dateKey = format(startOfDay(booking.date), 'yyyy-MM-dd');
      const currentRevenue = revenueByDay.get(dateKey) || 0;
      revenueByDay.set(dateKey, currentRevenue + Number(booking.service.price));
    });

    // Converter para array para o gráfico
    const dailyRevenueChart: DailyRevenue[] = Array.from(revenueByDay.entries()).map(
      ([dateKey, revenue]) => ({
        date: format(new Date(dateKey), 'dd/MM', { locale: ptBR }),
        revenue: Math.round(revenue * 100) / 100, // Arredondar para 2 casas decimais
      })
    );

    return {
      success: true,
      metrics: {
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        monthRevenue: Math.round(monthRevenue * 100) / 100,
        totalBookings,
        dailyRevenueChart,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    return {
      success: false,
      error: 'Erro ao carregar métricas. Tente novamente.',
    };
  }
}
