"use client";

import Link from "next/link";
import { Users, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyCustomersState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        {/* Ícone */}
        <div className="mb-6 rounded-full bg-muted p-6">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold tracking-tight mb-2">
          Nenhum cliente ainda
        </h3>

        {/* Descrição motivacional */}
        <p className="text-center text-muted-foreground max-w-md mb-6">
          Faça seu primeiro agendamento e comece a construir sua base de
          clientes fiéis. Cada cliente é uma oportunidade de crescimento!
        </p>

        {/* Botão CTA */}
        <Button asChild size="lg" className="gap-2">
          <Link href="/admin/bookings">
            <Calendar className="h-4 w-4" />
            Criar Primeiro Agendamento
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
