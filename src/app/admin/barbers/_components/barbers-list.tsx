'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SaveBarberDialog } from '@/app/admin/barbers/_components/save-barber-dialog';
import { BarberItem } from '@/app/admin/barbers/_components/barber-item';

interface Barber {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
}

interface BarbersListProps {
  barbers: Barber[];
}

export function BarbersList({ barbers }: BarbersListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | undefined>(
    undefined
  );

  const handleNewBarber = () => {
    setSelectedBarber(undefined);
    setDialogOpen(true);
  };

  const handleEditBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header da Lista */}
      <div className="flex md:flex-row flex-col gap-4 md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Minha Equipe</h2>
          <p className="text-muted-foreground">
            Gerencie os barbeiros da sua barbearia
          </p>
        </div>
        <Button onClick={handleNewBarber} size="lg">
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Barbeiro
        </Button>
      </div>

      {/* Lista de Barbeiros */}
      {barbers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-105 flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-2">
              Nenhum barbeiro cadastrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você ainda não cadastrou nenhum barbeiro. Comece adicionando o
              primeiro membro da sua equipe.
            </p>
            <Button onClick={handleNewBarber}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Barbeiro
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <BarberItem
              key={barber.id}
              barber={barber}
              onEdit={handleEditBarber}
            />
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar Barbeiro */}
      <SaveBarberDialog
        barber={selectedBarber}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
