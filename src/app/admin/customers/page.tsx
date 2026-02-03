import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { CustomerStats } from "@/app/admin/customers/_components/customer-stats";
import { CustomersTable } from "@/app/admin/customers/_components/customers-table";
import { EmptyCustomersState } from "@/app/admin/customers/_components/empty-customers-state";

export default async function CustomersPage() {
  // 1. Verificar sessão
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // 2. Buscar barbearia do utilizador
  const barbershop = await prisma.barbershop.findFirst({
    where: {
      ownerId: session.user.id,
    },
  });

  if (!barbershop) {
    redirect("/admin");
  }

  // 3. Buscar clientes com contagem de agendamentos e última visita
  const customers = await prisma.customer.findMany({
    where: {
      barbershopId: barbershop.id,
    },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
      bookings: {
        take: 1,
        orderBy: {
          date: "desc",
        },
        select: {
          date: true,
        },
      },
    },
    orderBy: {
      bookings: {
        _count: "desc",
      },
    },
  });

  // Serializar dados para passar ao Client Component
  const serializedCustomers = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    totalBookings: customer._count.bookings,
    lastVisit: customer.bookings[0]?.date.toISOString() || null,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AdminHeader
        showLogo
        showNavigation
        barbershop={barbershop}
        user={session.user}
      />

      <div className="container mx-auto space-y-8 p-4 md:p-8">
        {/* Título */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestão de Clientes
          </h2>
          <p className="text-muted-foreground">
            Acompanhe seus clientes, fidelidade e histórico de visitas
          </p>
        </div>

        {serializedCustomers.length === 0 ? (
          <EmptyCustomersState />
        ) : (
          <>
            {/* Métricas */}
            <CustomerStats customers={serializedCustomers} />

            {/* Tabela de Clientes */}
            <CustomersTable
              customers={serializedCustomers}
              barbershop={barbershop}
            />
          </>
        )}
      </div>
    </div>
  );
}
