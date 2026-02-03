import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { BarbersList } from "@/app/admin/barbers/_components/barbers-list";

export default async function BarbersPage() {
  // 1. Verificar sessão
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // 2. Buscar barbearia do usuário
  const barbershop = await prisma.barbershop.findFirst({
    where: {
      ownerId: session.user.id,
    },
    include: {
      barbers: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  // 3. Se não tiver barbearia, redirecionar para criar uma
  if (!barbershop) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AdminHeader
        showLogo
        showNavigation
        user={session.user}
        barbershop={barbershop}
      />

      <main className="container mx-auto px-4 py-8">
        <BarbersList barbers={barbershop.barbers} />
      </main>
    </div>
  );
}
