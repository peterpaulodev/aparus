'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react'; // Adicionar useEffect
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Barber {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface BarberFilterProps {
  barbers: Barber[];
  defaultValue?: string;
}

export function BarberFilter({ barbers, defaultValue }: BarberFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingBarberId, setLoadingBarberId] = useState<string | null>(null);

  // Resetar loading após 2 segundos (fallback caso o recarregamento demore ou falhe)
  useEffect(() => {
    if (loadingBarberId) {
      const timer = setTimeout(() => setLoadingBarberId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingBarberId]);

  const handleSelect = (barberId?: string) => {
    if (loadingBarberId) return; // Evitar cliques múltiplos
    setLoadingBarberId(barberId || 'all'); // 'all' para "Todos"
    const params = new URLSearchParams(searchParams.toString());
    if (barberId) {
      params.set('barberId', barberId);
    } else {
      params.delete('barberId');
    }
    router.push(`?${params.toString()}`);
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant="secondary"
        className={`shrink-0 h-auto border-2 transition-all hover:border-primary/50 ${!defaultValue ? 'border-primary bg-primary/5' : 'border-border'}`}
        onClick={() => handleSelect()}
        disabled={loadingBarberId === 'all'} // Desabilitar se loading
      >
        {loadingBarberId === 'all' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Todos
      </Button>
      {barbers.map((barber) => (
        <Button
          variant="secondary"
          key={barber.id}
          className={`shrink-0 h-auto flex items-center gap-2 border-2 transition-all hover:border-primary/50 ${defaultValue === barber.id ? 'border-primary bg-primary/5' : 'border-border'}`}
          onClick={() => handleSelect(barber.id)}
          disabled={loadingBarberId === barber.id} // Desabilitar se loading
        >
          {loadingBarberId === barber.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarImage src={barber.avatarUrl || undefined} alt={barber.name} />
              <AvatarFallback>{getInitials(barber.name)}</AvatarFallback>
            </Avatar>
          )}
          {barber.name}
        </Button>
      ))}
    </div>
  );
}