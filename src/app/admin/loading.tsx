import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto space-y-8 p-4 md:p-8">
        {/* Título da Barbearia */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Título "Resumo Financeiro" */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Grid de 3 Métricas Financeiras */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1 - Faturamento Hoje (Destaque) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>

          {/* Card 2 - Faturamento Mensal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-28 mb-2" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>

          {/* Card 3 - Total de Cortes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-20 mb-2" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        </div>

        {/* Card do Gráfico */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>

          {/* Lista de 5 Agendamentos */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
