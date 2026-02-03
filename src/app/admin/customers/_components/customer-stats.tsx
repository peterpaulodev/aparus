"use client";

import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { differenceInDays } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerStatsProps {
  customers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
    totalBookings: number;
    lastVisit: string | null;
  }>;
}

export function CustomerStats({ customers }: CustomerStatsProps) {
  const now = new Date();

  // Calcular métricas
  const totalCustomers = customers.length;

  const activeCustomers = customers.filter((customer) => {
    if (!customer.lastVisit) return false;
    const lastVisitDate = new Date(customer.lastVisit);
    const daysSinceLastVisit = differenceInDays(now, lastVisitDate);
    return daysSinceLastVisit <= 30;
  }).length;

  const inactiveCustomers = customers.filter((customer) => {
    if (!customer.lastVisit) return true; // Sem visita = inativo
    const lastVisitDate = new Date(customer.lastVisit);
    const daysSinceLastVisit = differenceInDays(now, lastVisitDate);
    return daysSinceLastVisit > 30;
  }).length;

  // Taxa de retorno: (clientes ativos / total) * 100
  const returnRate =
    totalCustomers > 0
      ? Math.round((activeCustomers / totalCustomers) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Total de Clientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Clientes
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground mt-1">Base completa</p>
        </CardContent>
      </Card>

      {/* Card 2: Clientes Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCustomers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Última visita ≤ 30 dias
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Clientes Sumidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Clientes Ausentes
          </CardTitle>
          <UserX className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveCustomers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Sem visita há +30 dias
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Taxa de Retorno */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{returnRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Clientes ativos no mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
