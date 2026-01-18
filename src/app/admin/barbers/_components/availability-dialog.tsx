'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { addMinutes, format, parse, isBefore, isAfter, isEqual } from 'date-fns';

import { updateBarberAvailability } from '@/app/_actions/manage-barbers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Barber {
  id: string;
  name: string;
  availability?: Record<string, unknown>;
}

interface AvailabilityDialogProps {
  barber: Barber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
  lunchStart: string;
  lunchEnd: string;
}

type WeekSchedule = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
};

const DAYS_PT = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
};

const DEFAULT_SCHEDULE: DaySchedule = {
  enabled: true,
  start: '09:00',
  end: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
};

export function AvailabilityDialog({ barber, open, onOpenChange }: AvailabilityDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(45);
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { ...DEFAULT_SCHEDULE },
    tuesday: { ...DEFAULT_SCHEDULE },
    wednesday: { ...DEFAULT_SCHEDULE },
    thursday: { ...DEFAULT_SCHEDULE },
    friday: { ...DEFAULT_SCHEDULE },
    saturday: { ...DEFAULT_SCHEDULE, enabled: false },
  });

  // Carregar availability existente ao abrir
  useEffect(() => {
    if (open && barber.availability) {
      // Tentar converter o formato antigo para o novo
      const loadedSchedule: Partial<WeekSchedule> = {};

      Object.keys(DAYS_PT).forEach((day) => {
        const dayKey = day as keyof WeekSchedule;
        const dayData = barber.availability?.[day] as Record<string, unknown> | undefined;

        if (dayData && typeof dayData === 'object') {
          // Formato antigo: { available: true, start: '09:00', end: '18:00' }
          if ('available' in dayData) {
            loadedSchedule[dayKey] = {
              enabled: dayData.available as boolean,
              start: dayData.start as string || '09:00',
              end: dayData.end as string || '18:00',
              lunchStart: '12:00',
              lunchEnd: '13:00',
            };
          }
        }
      });

      if (Object.keys(loadedSchedule).length > 0) {
        setSchedule((prev) => ({ ...prev, ...loadedSchedule }));
      }
    }
  }, [open, barber]);

  // Função para gerar horários de um dia
  const generateDayTimeSlots = (day: DaySchedule): string[] => {
    if (!day.enabled) return [];

    const slots: string[] = [];
    const baseDate = new Date(2000, 0, 1); // Data base para trabalhar com horários

    // Converter strings de horário para Date objects
    const startTime = parse(day.start, 'HH:mm', baseDate);
    const endTime = parse(day.end, 'HH:mm', baseDate);
    const lunchStart = parse(day.lunchStart, 'HH:mm', baseDate);
    const lunchEnd = parse(day.lunchEnd, 'HH:mm', baseDate);

    let currentTime = startTime;

    while (isBefore(currentTime, endTime)) {
      // Verificar se está no horário de almoço
      const isInLunchTime =
        (isAfter(currentTime, lunchStart) || isEqual(currentTime, lunchStart)) &&
        isBefore(currentTime, lunchEnd);

      if (isInLunchTime) {
        // Pular para o fim do almoço
        currentTime = lunchEnd;
        continue;
      }

      // Adicionar horário ao array
      const timeString = format(currentTime, 'HH:mm');
      slots.push(timeString);

      // Avançar para o próximo intervalo
      currentTime = addMinutes(currentTime, intervalMinutes);
    }

    return slots;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Gerar availability no formato esperado pela Server Action
      const availability: Record<string, string[]> = {};

      Object.entries(schedule).forEach(([day, daySchedule]) => {
        availability[day] = generateDayTimeSlots(daySchedule);
      });

      const result = await updateBarberAvailability({
        barberId: barber.id,
        availability,
      });

      if (result.success) {
        toast.success('Horários atualizados com sucesso!');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error('Erro ao atualizar horários', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar horários:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao atualizar os horários.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDaySchedule = (
    day: keyof WeekSchedule,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={() => !isSubmitting && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-[50%] top-[50%] z-50 max-h-[90vh] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Horários de: {barber.name}</h2>
            <p className="text-sm text-muted-foreground">
              Configure os dias e horários de trabalho
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Intervalo entre cortes */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label htmlFor="intervalMinutes" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo de Intervalo entre Cortes (minutos)
            </Label>
            <Input
              id="intervalMinutes"
              type="number"
              min="15"
              max="120"
              step="15"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Duração de cada agendamento (ex: 45 minutos por corte)
            </p>
          </div>

          {/* Dias da semana */}
          <div className="space-y-4">
            {(Object.entries(DAYS_PT) as [keyof WeekSchedule, string][]).map(([dayKey, dayName]) => {
              const daySchedule = schedule[dayKey];

              return (
                <div key={dayKey} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id={`${dayKey}-enabled`}
                      checked={daySchedule.enabled}
                      onChange={(e) => updateDaySchedule(dayKey, 'enabled', e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label
                      htmlFor={`${dayKey}-enabled`}
                      className="text-base font-semibold cursor-pointer"
                    >
                      {dayName}
                    </Label>
                    {!daySchedule.enabled && (
                      <span className="text-xs text-muted-foreground">(Folga)</span>
                    )}
                  </div>

                  {daySchedule.enabled && (
                    <div className="grid grid-cols-2 gap-4 ml-7">
                      <div className="space-y-2">
                        <Label htmlFor={`${dayKey}-start`} className="text-sm">
                          Início do Turno
                        </Label>
                        <Input
                          id={`${dayKey}-start`}
                          type="time"
                          value={daySchedule.start}
                          onChange={(e) => updateDaySchedule(dayKey, 'start', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${dayKey}-end`} className="text-sm">
                          Fim do Turno
                        </Label>
                        <Input
                          id={`${dayKey}-end`}
                          type="time"
                          value={daySchedule.end}
                          onChange={(e) => updateDaySchedule(dayKey, 'end', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${dayKey}-lunchStart`} className="text-sm">
                          Início do Almoço
                        </Label>
                        <Input
                          id={`${dayKey}-lunchStart`}
                          type="time"
                          value={daySchedule.lunchStart}
                          onChange={(e) => updateDaySchedule(dayKey, 'lunchStart', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${dayKey}-lunchEnd`} className="text-sm">
                          Fim do Almoço
                        </Label>
                        <Input
                          id={`${dayKey}-lunchEnd`}
                          type="time"
                          value={daySchedule.lunchEnd}
                          onChange={(e) => updateDaySchedule(dayKey, 'lunchEnd', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Horários'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
