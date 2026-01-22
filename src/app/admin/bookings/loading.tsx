// filepath: src/app/admin/bookings/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simular Header (AdminHeader) */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Skeleton className="h-8 w-48" /> {/* Logo ou título */}
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
            <Skeleton className="h-4 w-24" /> {/* Nome */}
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 p-4 md:p-8">
        {/* Título e botão de criação */}
        <div className="flex md:flex-row flex-col gap-4 md:items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" /> {/* Título */}
            <Skeleton className="h-4 w-64 mt-2" /> {/* Descrição */}
          </div>
          <Skeleton className="h-10 w-32" /> {/* Botão CreateBookingDialog */}
        </div>

        {/* Filtros */}
        <div className="max-w-md">
          <Skeleton className="h-10 w-full" /> {/* DateFilter */}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Skeleton className="h-12 w-20" /> {/* BarberFilter - "Todos" */}
          <Skeleton className="h-12 w-32" /> {/* Barber 1 */}
          <Skeleton className="h-12 w-32" /> {/* Barber 2 */}
          {/* Adicione mais skeletons conforme o número esperado de barbeiros */}
        </div>

        {/* Lista de Agendamentos (skeletons para cards) */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" /> {/* Contador de agendamentos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => ( // Simular 6 cards
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-5 w-32" />
                  </CardTitle>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}