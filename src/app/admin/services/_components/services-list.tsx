'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SaveServiceDialog } from '@/app/admin/services/_components/save-service-dialog';
import { ServiceItem } from '@/app/admin/services/_components/service-item';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
}

interface ServicesListProps {
  services: Service[];
}

export function ServicesList({ services }: ServicesListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    undefined
  );

  const handleNewService = () => {
    setSelectedService(undefined);
    setDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header da Lista */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Serviços</h2>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pela sua barbearia
          </p>
        </div>
        <Button onClick={handleNewService} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Lista de Serviços */}
      {services.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-105 flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-2">
              Nenhum serviço cadastrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você ainda não cadastrou nenhum serviço. Comece adicionando o
              primeiro serviço da sua barbearia.
            </p>
            <Button onClick={handleNewService}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Serviço
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              onEdit={handleEditService}
            />
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar Serviço */}
      <SaveServiceDialog
        service={selectedService}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
