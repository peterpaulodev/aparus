
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { redirect } from "next/navigation";
import { EditBarbershopForm } from "./_components/edit-barbershop-form";

export default async function SettingsPage() {
  // 1. Verificar sessão
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  // 2. Buscar barbearia do usuário
  const barbershop = await prisma.barbershop.findFirst({
    where: {
      ownerId: session.user.id,
    },
  });

  if (!barbershop) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AdminHeader
        showLogo
        showNavigation
        barbershop={barbershop}
        user={session.user}
      />

      <div className="container mx-auto space-y-6 p-4 md:p-8">
        <div className="flex md:flex-row flex-col gap-4 md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Configurar Barbearia</h2>
            <p className="text-muted-foreground">
              Gerencie as informações da sua barbearia.
            </p>
          </div>
        </div>

        <EditBarbershopForm barbershop={barbershop} />
      </div>
    </div>
  );
}
