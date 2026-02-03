'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, DollarSign, User, Loader2, Scissors } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { Service, Barber } from '@prisma/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { saveBooking } from '@/app/_actions/save-booking';
import { getAvailableTimes } from '@/app/_actions/get-available-times';
import { getCustomerName } from '@/app/_actions/get-customer';
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
import { useRouter } from 'next/navigation';
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
  barbershopSlug,
}: BookingItemProps) {
  // Estados
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoadingName, setIsLoadingName] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Ref para evitar lookups duplicados
  const lastLookupPhoneRef = useRef<string>('');

  // Refs para auto-scroll progressivo
  const dateStepRef = useRef<HTMLDivElement>(null);
  const timeStepRef = useRef<HTMLDivElement>(null);
  const formStepRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Função para formatar telefone com máscara
  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, '');

    // Limita a 11 dígitos
    const limited = cleaned.slice(0, 11);

    // Aplica a máscara
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else if (limited.length <= 10) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  // Função para buscar nome do cliente pelo telefone
  const handlePhoneLookup = async (phone: string) => {
    const normalizedPhone = phone.replace(/\D/g, '');

    // Valida se tem pelo menos 11 dígitos
    if (normalizedPhone.length < 11) {
      return;
    }

    // Evita lookups duplicados
    if (lastLookupPhoneRef.current === normalizedPhone) {
      return;
    }

    // Só busca se o nome estiver vazio
    if (customerName.trim()) {
      return;
    }

    lastLookupPhoneRef.current = normalizedPhone;
    setIsLoadingName(true);

    try {
      const result = await getCustomerName({
        phone: normalizedPhone,
        barbershopId,
      });

      if (result.success && result.name) {
        setCustomerName(result.name);
        const firstName = result.name.split(' ')[0];
        toast.success(`Bem-vindo de volta, ${firstName}!`);
      }
    } catch (error) {
      console.error('[PHONE_LOOKUP_ERROR]', error);
    } finally {
      setIsLoadingName(false);
    }
  };

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

  // Auto-lookup quando telefone atingir 11 dígitos
  useEffect(() => {
    const normalizedPhone = customerPhone.replace(/\D/g, '');

    if (normalizedPhone.length === 11) {
      const timeoutId = setTimeout(() => {
        handlePhoneLookup(customerPhone);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [customerPhone, barbershopId]);

  // Auto-scroll: quando seleciona barbeiro, mostra calendário
  useEffect(() => {
    if (selectedBarber && dateStepRef.current) {
      const timeoutId = setTimeout(() => {
        dateStepRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedBarber]);

  // Auto-scroll: quando seleciona data, mostra horários
  useEffect(() => {
    if (selectedDate && timeStepRef.current) {
      const timeoutId = setTimeout(() => {
        timeStepRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate]);

  // Auto-scroll: quando seleciona horário, mostra formulário
  useEffect(() => {
    if (selectedTime && formStepRef.current) {
      const timeoutId = setTimeout(() => {
        formStepRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedTime]);

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

      if (result.success && result.bookingId) {
        setIsOpen(false);
        router.push(`/${barbershopSlug}/success?bookingId=${result.bookingId}`);
      } else {
        setErrorMessage(result?.error || "Tente novamente mais tarde.");
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

      <SheetContent className="w-full sm:max-w-lg flex flex-col h-[100dvh] p-0 gap-0">
        {/* CABEÇALHO (Fixo no topo) */}
        <div className="p-6 pb-2 border-b">
          <SheetHeader>
            <SheetTitle>Agendar {service.name}</SheetTitle>
            <SheetDescription>
              Siga os passos para fazer seu agendamento
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* CORPO (Scrollável)
           flex-1: Ocupa todo o espaço disponível no meio.
           overflow-y-auto: Só essa parte faz scroll.
        */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* PASSO 1: Selecionar Profissional */}
          <div>
            <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              1. Escolha o profissional
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => handleBarberChange(barber.id)}
                  type="button"
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
            <div ref={dateStepRef}>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                2. Selecione a data
              </h3>
              {/* MUDANÇA 2: Wrapper para o Calendário não quebrar o layout lateralmente */}
              <div className="border rounded-md p-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  locale={ptBR}
                  disabled={(date) => date < new Date()}
                  className="rounded-md"
                // Removemos w-full aqui para o calendário não tentar esticar demais
                />
              </div>
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
            <div ref={timeStepRef}>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                3. Escolha o horário
              </h3>

              {isLoadingTimes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {/* Ajustei o grid para caber mais horários e reduzir altura */}
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-xs px-2"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Sem horários livres
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASSO 4: Dados do Cliente */}
          {selectedBarber && selectedDate && selectedTime && (
            <div ref={formStepRef} className="space-y-3 pb-4">
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                4. Seus dados
              </h3>
              <div className="space-y-4 border p-4 rounded-md">
                {/* Telefone primeiro */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(99) 99999-9999"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(formatPhoneNumber(e.target.value))}
                      onBlur={(e) => handlePhoneLookup(e.target.value)}
                      disabled={isPending}
                      autoComplete="tel"
                    />
                    {isLoadingName && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Usaremos para enviar a confirmação do agendamento.
                  </p>
                </div>
                {/* Nome depois */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Digite seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isPending}
                    autoComplete="name"
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
        </div>

        {/* RODAPÉ (Fixo no fundo)
           border-t bg-card: Cria separação visual e garante que o conteúdo não vaze por trás.
           p-6: Padding generoso para facilitar o clique.
        */}
        <div className="p-6 border-t bg-card mt-auto z-10">
          {/* Resumo compacto opcional antes do botão */}
          {selectedBarber && selectedDate && selectedTime && service && (
            <div className="mb-4 flex justify-between text-sm text-muted-foreground">
              <span>{service.name}</span>
              <span className="font-bold text-foreground">{formatPrice(service.price.toString())}</span>
            </div>
          )}

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
