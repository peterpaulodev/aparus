'use client';

import { useState, useTransition } from 'react';
import { Calendar as CalendarIcon, Clock, DollarSign, User, Phone } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { Service, Barber } from '@prisma/client';
import { toast } from "sonner"
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { saveBooking } from '@/app/_actions/save-booking';
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
  barbershopId: string;
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
  barbershopId,
}: BookingItemProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirmBooking = () => {
    // Validações
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Por favor, selecione uma data e horário');
      return;
    }

    if (!selectedBarber) {
      setErrorMessage('Por favor, selecione um profissional');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Por favor, preencha seu nome e telefone');
      return;
    }

    setErrorMessage(null);

    // Combina data e hora
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(hours, minutes, 0, 0);

    // Executa a Server Action
    startTransition(async () => {
      const result = await saveBooking({
        barbershopId,
        serviceId: service.id,
        barberId: selectedBarber,
        date: bookingDate,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });

      if (result.success) {
        toast.success(
          `Agendamento confirmado com sucesso!\n\nServiço: ${service.name}\nData: ${selectedDate.toLocaleDateString('pt-BR')}\nHorário: ${selectedTime}`
        );

        // Resetar estado e fechar
        setSelectedDate(undefined);
        setSelectedTime(undefined);
        setSelectedBarber(undefined);
        setCustomerName('');
        setCustomerPhone('');
        setErrorMessage(null);
        setIsOpen(false);
      } else {
        setErrorMessage(result.error);
      }
    });
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
          <div className='h-96'>
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

          {/* Seção: Selecionar Profissional */}
          {selectedDate && selectedTime && (
            <div>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Escolha o profissional
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {barbers.map((barber) => (
                  <Button
                    key={barber.id}
                    variant={selectedBarber === barber.id ? 'default' : 'outline'}
                    onClick={() => setSelectedBarber(barber.id)}
                    className="justify-start h-auto py-3"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{barber.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Seção: Dados do Cliente */}
          {selectedDate && selectedTime && selectedBarber && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Seus dados</h3>
              <div className="space-y-2">
                <div>
                  <label htmlFor="name" className="text-sm text-muted-foreground">
                    Nome completo
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm text-muted-foreground">
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de erro */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Resumo do agendamento */}
          {selectedDate && selectedTime && selectedBarber && customerName && customerPhone && (
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
            disabled={
              !selectedDate ||
              !selectedTime ||
              !selectedBarber ||
              !customerName.trim() ||
              !customerPhone.trim() ||
              isPending
            }
          >
            {isPending ? 'Processando...' : 'Confirmar Agendamento'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
