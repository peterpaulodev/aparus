import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parse, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { UserNav } from '@/components/admin/user-nav';
import { BookingAdminItem } from '@/app/admin/bookings/_components/booking-admin-item';
import { DateFilter } from '@/app/admin/bookings/_components/date-filter';
import { CreateBookingDialog } from '@/app/admin/bookings/_components/create-booking-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AdminBookingsPageProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function AdminBookingsPage({
  searchParams,
}: AdminBookingsPageProps) {
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

  if (!barbershop) {
    redirect('/admin');
  }

  // 3. Obter data do filtro (ou usar hoje como padrão)
  const params = await searchParams;
  const dateParam = params.date;
  const selectedDate = dateParam
    ? parse(dateParam, 'yyyy-MM-dd', new Date())
    : new Date();

  // 4. Calcular início e fim do dia
  const startDate = startOfDay(selectedDate);
  const endDate = endOfDay(selectedDate);

  // 5. Buscar agendamentos do dia
  const bookings = await prisma.booking.findMany({
    where: {
      barbershopId: barbershop.id,
      date: {
        gte: startDate,
        lte: endDate,
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
  });

  // 6. Buscar dados para o formulário de criação
  const [customers, services, barbersData] = await Promise.all([
    prisma.customer.findMany({
      where: { barbershopId: barbershop.id },
      select: { id: true, name: true, phone: true },
      orderBy: { name: 'asc' },
    }),
    prisma.service.findMany({
      where: { barbershopId: barbershop.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.barber.findMany({
      where: { barbershopId: barbershop.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerir os agendamentos de {barbershop.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateBookingDialog
            customers={customers}
            services={services}
            barbers={barbersData}
          />
          <UserNav user={session.user} />
        </div>
      </div>

      {/* Filtro de Data */}
      <div className="max-w-md">
        <DateFilter />
      </div>

      {/* Lista de Agendamentos */}
      {bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Agenda Livre
            </CardTitle>
            <CardDescription>
              Não há agendamentos para{' '}
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Os agendamentos para este dia aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {bookings.length} {bookings.length === 1 ? 'agendamento' : 'agendamentos'} para{' '}
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <BookingAdminItem
                key={booking.id}
                booking={{
                  id: booking.id,
                  date: booking.date,
                  status: booking.status,
                  service: {
                    name: booking.service.name,
                    price: Number(booking.service.price),
                  },
                  customer: {
                    name: booking.customer.name,
                    phone: booking.customer.phone,
                  },
                  barber: {
                    name: booking.barber.name,
                    avatarUrl: booking.barber.avatarUrl,
                  },
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
