import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Calendar, DollarSign } from 'lucide-react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { UserNav } from '@/components/admin/user-nav';
import { BookingItem } from '@/app/admin/_components/booking-item';
import { CreateBarbershopForm } from '@/app/admin/_components/create-barbershop-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    include: {
      bookings: {
        include: {
          customer: true,
          service: true,
          barber: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  // Calcular estatísticas
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayBookings = barbershop?.bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= today && bookingDate < tomorrow;
  }) || [];

  const todayRevenue = todayBookings.reduce((total, booking) => {
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      return total + Number(booking.service.price);
    }
    return total;
  }, 0);

  const upcomingBookings = barbershop?.bookings.filter((booking) => {
    return new Date(booking.date) >= new Date();
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Painel de Controle
          </h1>
          <UserNav user={session.user} />
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
        {barbershop && (
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

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Total de Agendamentos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Agendamentos Hoje
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayBookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {todayBookings.length === 1 ? 'agendamento' : 'agendamentos'} para hoje
                  </p>
                </CardContent>
              </Card>

              {/* Faturamento Estimado */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento Hoje
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(todayRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estimativa baseada em agendamentos confirmados
                  </p>
                </CardContent>
              </Card>

              {/* Próximos Agendamentos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Próximos Agendamentos
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {upcomingBookings.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Agendamentos futuros
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Seção: Próximos Agendamentos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight">
                  Próximos Agendamentos
                </h3>
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
                  {upcomingBookings.map((booking) => (
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
