import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

      <div className="container mx-auto space-y-6 p-4 md:p-8">
        {/* Título da Página */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>

        {/* Card 1: Identidade Visual */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </CardHeader>
        </Card>

        {/* Card 2: Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-80" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grid com 2 inputs */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            {/* Input full width */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
}
