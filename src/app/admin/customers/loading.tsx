import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto space-y-8 p-4 md:p-8">
        {/* Título */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Grid de Métricas (4 Cards) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Card da Tabela */}
        <Card>
          <CardContent className="p-6">
            {/* Barra de Filtros */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-10 w-48" />
            </div>

            {/* Contador */}
            <Skeleton className="h-4 w-32 mb-4" />

            {/* Tabela */}
            <div className="rounded-md border">
              {/* Header da Tabela */}
              <div className="border-b p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>

              {/* Linhas da Tabela */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border-b p-4 last:border-b-0">
                  <div className="flex items-center gap-4">
                    {/* Avatar + Nome/Telefone */}
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>

                    {/* Badge Status */}
                    <Skeleton className="h-6 w-20" />

                    {/* Fidelidade */}
                    <Skeleton className="h-4 w-16" />

                    {/* Data */}
                    <Skeleton className="h-4 w-24" />

                    {/* Botão WhatsApp */}
                    <Skeleton className="h-10 w-10 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
