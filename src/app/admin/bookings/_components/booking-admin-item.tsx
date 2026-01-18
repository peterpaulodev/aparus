'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { updateBookingStatus } from '@/app/_actions/update-booking-status';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPrice } from '@/lib/utils';

interface Booking {
  id: string;
  date: Date | string;
  status: string;
  service: {
    name: string;
    price: number;
  };
  customer: {
    name: string;
    phone: string;
  };
  barber: {
    name: string;
    avatarUrl: string | null;
  };
}

interface BookingAdminItemProps {
  booking: Booking;
}

export function BookingAdminItem({ booking }: BookingAdminItemProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const bookingDate = new Date(booking.date);

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleUpdateStatus = async (newStatus: 'COMPLETED' | 'CANCELED') => {
    setIsUpdating(true);

    try {
      const result = await updateBookingStatus({
        bookingId: booking.id,
        status: newStatus,
      });

      if (result.success) {
        const statusMessages = {
          COMPLETED: 'Agendamento finalizado com sucesso!',
          CANCELED: 'Agendamento cancelado com sucesso!',
        };

        toast.success(statusMessages[newStatus], {
          description: `Cliente: ${booking.customer.name}`,
        });

        // Atualizar a página
        router.refresh();
      } else {
        toast.error('Erro ao atualizar agendamento', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao atualizar o agendamento. Tente novamente.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Renderizar badge de status
  const renderStatusBadge = () => {
    switch (booking.status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="mr-1 h-3 w-3" />
            Concluído
          </Badge>
        );
      case 'CANCELED':
        return (
          <Badge variant="destructive">
            <X className="mr-1 h-3 w-3" />
            Cancelado
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              {format(bookingDate, "HH:mm", { locale: ptBR })}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(bookingDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          {renderStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cliente */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Cliente</p>
          <p className="text-lg font-semibold">{booking.customer.name}</p>
          <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
        </div>

        {/* Serviço */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Serviço</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">{booking.service.name}</p>
            <p className="text-lg font-bold">
              {formatPrice(Number(booking.service.price))}
            </p>
          </div>
        </div>

        {/* Barbeiro */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Barbeiro</p>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={booking.barber.avatarUrl || undefined}
                alt={booking.barber.name}
              />
              <AvatarFallback>{getInitials(booking.barber.name)}</AvatarFallback>
            </Avatar>
            <p className="font-medium">{booking.barber.name}</p>
          </div>
        </div>
      </CardContent>

      {/* Footer com Ações */}
      {booking.status === 'CONFIRMED' && (
        <CardFooter className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => handleUpdateStatus('COMPLETED')}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Finalizar
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => handleUpdateStatus('CANCELED')}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
