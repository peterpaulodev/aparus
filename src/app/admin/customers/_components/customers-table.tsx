"use client";

import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Filter } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppButton } from "@/app/admin/customers/_components/whatsapp-button";
import { formatPhoneNumber } from "@/lib/utils";

interface CustomersTableProps {
  customers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
    totalBookings: number;
    lastVisit: string | null;
  }>;
  barbershop: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  } | null;
}

/**
 * Obtém as iniciais do nome (primeiras letras de cada palavra)
 */
function getInitials(name: string): string {
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function CustomersTable({ customers, barbershop }: CustomersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // Filtrar clientes com base na busca e toggle "sumidos"
  const filteredCustomers = useMemo(() => {
    const now = new Date();
    let filtered = customers;

    // Filtro de busca (nome ou telefone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const cleanQuery = query.replace(/\D/g, ""); // Remove não-dígitos da busca

      filtered = filtered.filter((customer) => {
        const nameMatch = customer.name.toLowerCase().includes(query);
        // Só busca por telefone se houver dígitos na query
        const phoneMatch =
          cleanQuery.length > 0
            ? customer.phone.replace(/\D/g, "").includes(cleanQuery)
            : false;
        return nameMatch || phoneMatch;
      });
    }

    // Filtro "Recuperar Sumidos" (>30 dias)
    if (showInactiveOnly) {
      filtered = filtered.filter((customer) => {
        if (!customer.lastVisit) return true; // Sem visita = sumido
        const lastVisitDate = new Date(customer.lastVisit);
        const daysSinceLastVisit = differenceInDays(now, lastVisitDate);
        return daysSinceLastVisit > 30;
      });
    }

    return filtered;
  }, [customers, searchQuery, showInactiveOnly]);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Barra de Filtros */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          {/* Input de Busca */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Toggle "Recuperar Sumidos" */}
          <Button
            variant={showInactiveOnly ? "default" : "outline"}
            size="default"
            onClick={() => setShowInactiveOnly(!showInactiveOnly)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showInactiveOnly ? "Mostrar Todos" : "Recuperar Sumidos"}
          </Button>
        </div>

        {/* Contador de resultados */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredCustomers.length}{" "}
          {filteredCustomers.length === 1 ? "cliente" : "clientes"}
          {searchQuery && " encontrado(s)"}
          {showInactiveOnly && " ausente(s)"}
        </p>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fidelidade</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const now = new Date();
                  const daysSinceLastVisit = customer.lastVisit
                    ? differenceInDays(now, new Date(customer.lastVisit))
                    : null;

                  const isActive =
                    daysSinceLastVisit !== null && daysSinceLastVisit <= 30;

                  return (
                    <TableRow key={customer.id}>
                      {/* Coluna: Cliente (Avatar + Nome + Telefone) */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPhoneNumber(customer.phone)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Coluna: Status (Badge) */}
                      <TableCell>
                        {isActive ? (
                          <Badge
                            variant="default"
                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            Ativo
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-destructive/10 text-destructive"
                          >
                            Ausente
                          </Badge>
                        )}
                      </TableCell>

                      {/* Coluna: Fidelidade */}
                      <TableCell>
                        <span className="font-medium">
                          {customer.totalBookings}{" "}
                          {customer.totalBookings === 1 ? "corte" : "cortes"}
                        </span>
                      </TableCell>

                      {/* Coluna: Última Visita */}
                      <TableCell>
                        {customer.lastVisit ? (
                          <span className="text-sm">
                            {format(
                              new Date(customer.lastVisit),
                              "dd/MM/yyyy",
                              {
                                locale: ptBR,
                              },
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Nunca
                          </span>
                        )}
                      </TableCell>

                      {/* Coluna: Ação (WhatsApp) */}
                      <TableCell className="text-right">
                        <WhatsAppButton
                          customerName={customer.name}
                          phone={customer.phone}
                          barbershopName={
                            barbershop ? barbershop.name : "sua barbearia"
                          }
                          barbershopSlug={barbershop ? barbershop.slug : ""}
                          daysSinceLastVisit={daysSinceLastVisit}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
