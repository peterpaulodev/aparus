import { notFound } from 'next/navigation';
import Image from 'next/image';
import { User, MapPin, Phone } from 'lucide-react';
import { Metadata } from 'next';
import type { Service } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { BookingItem } from '@/components/booking-item';

import { BarberCarousel } from './_components/barber-carousel';

type Props = {
  params: Promise<{ slug: string }>;
};

// Gera metadata dinâmica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!barbershop) {
    return {
      title: 'Barbearia não encontrada',
    };
  }

  return {
    title: `${barbershop.name} - Agende seu horário`,
    description: `Reserve seu horário na ${barbershop.name}. Profissionais qualificados e serviços de qualidade.`,
  };
}

export default async function BarbershopPage({ params }: Props) {
  const { slug } = await params;

  // Busca a barbearia com serviços e barbeiros
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: {
      services: {
        orderBy: { name: 'asc' },
      },
      barbers: {
        orderBy: { name: 'asc' },
      },
    },
  });

  // Se não encontrar, retorna 404
  if (!barbershop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com logo/capa da barbearia */}
      <header className="relative bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            {/* Logo/Avatar da barbearia */}
            <div className="relative h-30 w-30 shrink-0 overflow-hidden rounded-lg border-2 border-border sm:h-32 sm:w-32">
              {barbershop.logoUrl ? (
                <Image
                  src={barbershop.logoUrl}
                  alt={`Logo ${barbershop.name}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                </div>
              )}
            </div>

            {/* Nome da barbearia */}
            <div className="text-center sm:text-left space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {barbershop.name}
              </h1>

              <div className="flex flex-col items-center gap-y-2 sm:flex-row sm:gap-x-6 text-sm">
                {barbershop.address && (
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{barbershop.address}</span>
                  </div>
                )}
                {barbershop.address && barbershop.phone && (
                  <div className="hidden sm:block w-px h-4 bg-border" />
                )}

                {/* Item Telefone */}
                {barbershop.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    {/* Adicionei hover para indicar que é clicável se quiseres transformar em link depois */}
                    <span>{barbershop.phone}</span>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <p className="mt-2 text-sm text-muted-foreground sm:text-base leading-relaxed max-w-2xl">
                {barbershop.description ? barbershop.description : 'Agende o seu horário conosco!'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Seção: Serviços */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
            Nossos Serviços
          </h2>

          {barbershop.services.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum serviço disponível no momento.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {barbershop.services.map((service: Service) => (
                <BookingItem
                  key={service.id}
                  service={service}
                  barbers={barbershop.barbers}
                  barbershopSlug={slug}
                  barbershopId={barbershop.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Seção: Profissionais */}
        <section>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
            Nossos Profissionais
          </h2>

          {barbershop.barbers.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum profissional ativo no momento.
            </p>
          ) : (
            <BarberCarousel barbers={barbershop.barbers} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-5">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Aparus. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
