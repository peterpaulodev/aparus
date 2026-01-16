import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Scissors, User } from 'lucide-react';
import type { Booking, Service, Barber, Customer } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type BookingItemProps = {
  booking: Booking & {
    service: Service;
    barber: Barber;
    customer: Customer;
  };
};

const STATUS_CONFIG = {
  CONFIRMED: {
    label: 'Confirmado',
    variant: 'default' as const,
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  PENDING: {
    label: 'Pendente',
    variant: 'secondary' as const,
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  CANCELED: {
    label: 'Cancelado',
    variant: 'destructive' as const,
    className: 'bg-red-500 hover:bg-red-600 text-white',
  },
  COMPLETED: {
    label: 'Concluído',
    variant: 'outline' as const,
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
} as const;

export function BookingItem({ booking }: BookingItemProps) {
  const bookingDate = new Date(booking.date);
  const statusConfig = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || {
    label: booking.status,
    variant: 'outline' as const,
    className: '',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Esquerda: Horário e Data */}
          <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 p-3 min-w-[100px]">
            <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
              <Clock className="h-5 w-5" />
              {format(bookingDate, 'HH:mm')}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(bookingDate, "d 'de' MMM", { locale: ptBR })}
            </div>
          </div>

          {/* Centro: Informações do agendamento */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {booking.customer.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {booking.service.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Com: <span className="font-medium">{booking.barber.name}</span>
              </span>
            </div>
          </div>

          {/* Direita: Status */}
          <div className="flex items-center justify-end sm:justify-center">
            <Badge
              variant={statusConfig.variant}
              className={cn('font-semibold', statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
