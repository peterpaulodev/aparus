'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, DollarSign } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { Service, Barber } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from "@/components/ui/separator"

import { formatPrice, formatDuration } from '@/lib/utils';

type BookingItemProps = {
  service: Service;
  barbers: Barber[];
  barbershopSlug: string;
};

// Horários disponíveis (estáticos por enquanto)
const AVAILABLE_TIMES = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
];

export function BookingItem({
  service,
  barbers,
  barbershopSlug,
}: BookingItemProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor, selecione uma data e horário');
      return;
    }

    // TODO: Implementar lógica de agendamento
    console.log('Agendamento:', {
      service: service.name,
      date: selectedDate,
      time: selectedTime,
    });

    alert(
      `Agendamento confirmado!\nServiço: ${service.name}\nData: ${selectedDate.toLocaleDateString('pt-BR')}\nHorário: ${selectedTime}`
    );

    // Resetar estado e fechar
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">{service.name}</CardTitle>
          {service.description && (
            <CardDescription className="line-clamp-2">
              {service.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            {/* Preço */}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {formatPrice(service.price.toString())}
              </span>
            </div>

            {/* Duração */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDuration(service.duration)}
              </span>
            </div>

            {/* Botão de Reserva */}
            <SheetTrigger asChild>
              <Button className="w-full mt-4" size="lg">
                Reservar
              </Button>
            </SheetTrigger>
          </div>
        </CardContent>
      </Card>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Agendar {service.name}</SheetTitle>
          <SheetDescription>
            Escolha a data e horário para seu agendamento
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="space-y-6 px-4 mb-12">
          {/* Seção: Calendário */}
          <div>
            <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Selecione a data
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              disabled={(date) => date < new Date()}
              className="rounded-md border w-full"
            />
          </div>

          {/* Seção: Horários disponíveis */}
          {selectedDate && (
            <div>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários disponíveis
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_TIMES.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="text-sm"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Resumo do agendamento */}
          {selectedDate && selectedTime && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold">Resumo do Agendamento</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Serviço:</span> {service.name}
                </p>
                <p>
                  <span className="font-medium">Data:</span>{' '}
                  {selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p>
                  <span className="font-medium">Horário:</span> {selectedTime}
                </p>
                <p>
                  <span className="font-medium">Duração:</span>{' '}
                  {formatDuration(service.duration)}
                </p>
                <p className="text-foreground font-semibold pt-1">
                  <span className="font-medium">Valor:</span>{' '}
                  {formatPrice(service.price.toString())}
                </p>
              </div>
            </div>
          )}

          {/* Botão de confirmação */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleConfirmBooking}
            disabled={!selectedDate || !selectedTime}
          >
            Confirmar Agendamento
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
