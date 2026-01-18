import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Calendar, DollarSign, Settings, UserCircle, TrendingUp, Scissors } from 'lucide-react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { UserNav } from '@/components/admin/user-nav';
import { BookingItem } from '@/app/admin/_components/booking-item';
import { CreateBarbershopForm } from '@/app/admin/_components/create-barbershop-form';
import { OverviewChart } from '@/app/admin/_components/overview-chart';
import { getDashboardMetrics } from '@/app/_actions/get-dashboard-metrics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default async function AdminPage() {
  // 1. Verificar sessão
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  // 2. Buscar barbearia do usuário
  const barbershop = await prisma.barbershop.findFirst({
    where: {
      ownerId: session.user.id,
    },
  });

  // 3. Buscar métricas do dashboard
  let metrics = null;
  if (barbershop) {
    const result = await getDashboardMetrics();
    if (result.success) {
      metrics = result.metrics;
    }
  }

  // 4. Buscar últimos agendamentos
  const upcomingBookings = barbershop
    ? await prisma.booking.findMany({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: new Date(),
        },
      },
      include: {
        customer: true,
        service: true,
        barber: true,
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    })
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              Painel de Controle
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {barbershop && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/services">
                    <Settings className="mr-2 h-4 w-4" />
                    Gerir Serviços
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/barbers">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Minha Equipe
                  </Link>
                </Button>
              </>
            )}
            <UserNav user={session.user} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estado: Sem Barbearia */}
        {!barbershop && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-center">
                Bem-vindo ao Aparatus! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Você ainda não tem uma barbearia cadastrada. Crie a sua primeira
                barbearia para começar a gerenciar seus agendamentos.
              </p>
              <CreateBarbershopForm />
            </CardContent>
          </Card>
        )}

        {/* Estado: Com Barbearia */}
        {barbershop && metrics && (
          <div className="space-y-8">
            {/* Nome da Barbearia */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {barbershop.name}
              </h2>
              <p className="text-muted-foreground">
                Gerencie seus agendamentos e acompanhe seu negócio
              </p>
            </div>

            {/* Resumo Financeiro - Header */}
            <div>
              <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Financeiro
              </h3>
            </div>

            {/* Grid de KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Card 1: Faturamento Hoje (Destaque) */}
              <Card className="md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento Hoje
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatPrice(metrics.todayRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Serviços concluídos hoje
                  </p>
                </CardContent>
              </Card>

              {/* Card 2: Faturamento Mensal */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento Mensal
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(metrics.monthRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total do mês atual
                  </p>
                </CardContent>
              </Card>

              {/* Card 3: Total de Cortes (Mês) */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Cortes
                  </CardTitle>
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.totalBookings}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agendamentos no mês
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Seção Gráfico */}
            <Card>
              <CardHeader>
                <CardTitle>Receita Diária</CardTitle>
                <CardDescription>
                  Últimos 7 dias de faturamento
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <OverviewChart data={metrics.dailyRevenueChart} />
              </CardContent>
            </Card>

            {/* Seção: Próximos Agendamentos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos Agendamentos
                </h3>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/bookings">Ver Todos</Link>
                </Button>
              </div>

              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum corte agendado
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      Quando seus clientes agendarem serviços, eles aparecerão aqui.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <BookingItem key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
