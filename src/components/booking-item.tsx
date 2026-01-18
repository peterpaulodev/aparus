'use client';

import { useState, useTransition, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, DollarSign, User, Loader2 } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { Service, Barber } from '@prisma/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { saveBooking } from '@/app/_actions/save-booking';
import { getAvailableTimes } from '@/app/_actions/get-available-times';
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

export function BookingItem({
  service,
  barbers,
  barbershopId,
}: BookingItemProps) {
  // Estados
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Buscar horários disponíveis quando barbeiro e data mudarem
  useEffect(() => {
    if (!selectedBarber || !selectedDate) {
      return;
    }

    let cancelled = false;

    const fetchTimes = async () => {
      setIsLoadingTimes(true);
      setSelectedTime(undefined);
      setAvailableTimes([]);
      setErrorMessage(null);

      try {
        const result = await getAvailableTimes({
          barberId: selectedBarber,
          date: selectedDate,
          serviceDuration: service.duration,
        });
        console.log('🚀 ~ fetchTimes ~ result:', result);

        if (cancelled) return;

        if (result.success && result.times) {
          setAvailableTimes(result.times);
          if (result.times.length === 0) {
            setErrorMessage('Não há horários disponíveis para esta data');
          }
        } else {
          setErrorMessage(result.error || 'Erro ao buscar horários');
          setAvailableTimes([]);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Erro ao buscar horários:', error);
        setErrorMessage('Erro ao buscar horários disponíveis');
        setAvailableTimes([]);
      } finally {
        if (!cancelled) {
          setIsLoadingTimes(false);
        }
      }
    };

    fetchTimes();

    return () => {
      cancelled = true;
    };
  }, [selectedBarber, selectedDate, service.duration]);

  // Resetar data e horário quando trocar de barbeiro
  const handleBarberChange = (barberId: string) => {
    setSelectedBarber(barberId);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setAvailableTimes([]);
    setErrorMessage(null);
  };

  // Resetar horário quando trocar de data
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  };

  const handleConfirmBooking = () => {
    // Validações
    if (!selectedBarber) {
      setErrorMessage('Por favor, selecione um profissional');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setErrorMessage('Por favor, selecione uma data e horário');
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
        setSelectedBarber(undefined);
        setSelectedDate(undefined);
        setSelectedTime(undefined);
        setAvailableTimes([]);
        setCustomerName('');
        setCustomerPhone('');
        setErrorMessage(null);
        setIsOpen(false);
      } else {
        setErrorMessage(result.error);
      }
    });
  };

  // Encontrar dados do barbeiro selecionado
  const selectedBarberData = barbers.find((b) => b.id === selectedBarber);

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
            Siga os passos para fazer seu agendamento
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-6 px-4 pb-12">
          {/* PASSO 1: Selecionar Profissional */}
          <div>
            <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              1. Escolha o profissional
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => handleBarberChange(barber.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:border-primary/50 ${selectedBarber === barber.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                    }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={barber.avatarUrl || undefined} alt={barber.name} />
                    <AvatarFallback>
                      {barber.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{barber.name}</p>
                    {barber.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {barber.description}
                      </p>
                    )}
                  </div>
                  {selectedBarber === barber.id && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PASSO 2: Selecionar Data */}
          {selectedBarber && (
            <div>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                2. Selecione a data
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                locale={ptBR}
                disabled={(date) => date < new Date()}
                className="rounded-md border w-full"
              />
            </div>
          )}

          {!selectedBarber && (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
              <User className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Selecione um profissional para continuar
              </p>
            </div>
          )}

          {/* PASSO 3: Selecionar Horário */}
          {selectedBarber && selectedDate && (
            <div>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                3. Escolha o horário
              </h3>

              {isLoadingTimes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
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
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Não há horários disponíveis para esta data
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tente selecionar outra data
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASSO 4: Dados do Cliente */}
          {selectedBarber && selectedDate && selectedTime && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">4. Seus dados</h3>
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
          {selectedBarber && selectedDate && selectedTime && selectedBarberData && customerName && customerPhone && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold">Resumo do Agendamento</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Profissional:</span> {selectedBarberData.name}
                </p>
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
              !selectedBarber ||
              !selectedDate ||
              !selectedTime ||
              !customerName.trim() ||
              !customerPhone.trim() ||
              isPending
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Agendamento'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
