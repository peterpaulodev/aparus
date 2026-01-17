import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { UserNav } from '@/components/admin/user-nav';
import { BarbersList } from '@/app/admin/barbers/_components/barbers-list';

export default async function BarbersPage() {
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
    include: {
      barbers: {
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  // 3. Se não tiver barbearia, redirecionar para criar uma
  if (!barbershop) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Gerenciar Equipe
          </h1>
          <UserNav user={session.user} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <BarbersList barbers={barbershop.barbers} />
      </main>
    </div>
  );
}
