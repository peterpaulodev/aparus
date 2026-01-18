'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Obter data da URL ou usar hoje como padrão
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam
    ? parse(dateParam, 'yyyy-MM-dd', new Date())
    : new Date();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      router.push(`/admin/bookings?date=${formattedDate}`);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </Button>

      {isCalendarOpen && (
        <div className="rounded-md border bg-background p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={ptBR}
          />
        </div>
      )}
    </div>
  );
}
