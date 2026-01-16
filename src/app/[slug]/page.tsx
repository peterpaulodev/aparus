import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, DollarSign, User } from 'lucide-react';
import { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

type Props = {
  params: { slug: string };
};

// Gera metadata dinâmica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
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
  // Busca a barbearia com serviços e barbeiros
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
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
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-border sm:h-32 sm:w-32">
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
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {barbershop.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Agende seu horário com facilidade
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
              {barbershop.services.map((service) => (
                <Card key={service.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.description && (
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      {/* Preço */}
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {formatPrice(service.price.toString())}
                        </span>
                      </div>

                      {/* Duração */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDuration(service.duration)}
                        </span>
                      </div>

                      {/* Botão de Reserva */}
                      <Button
                        className="w-full mt-4"
                        size="lg"
                        asChild
                      >
                        <a href={`/${params.slug}/booking/${service.id}`}>
                          Reservar
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
              Nenhum profissional cadastrado no momento.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {barbershop.barbers.map((barber) => (
                <Card key={barber.id} className="text-center">
                  <CardHeader className="pb-4">
                    <div className="flex justify-center">
                      <Avatar className="h-20 w-20 border-2 border-border">
                        <AvatarImage
                          src={barber.avatarUrl ?? undefined}
                          alt={barber.name}
                        />
                        <AvatarFallback className="text-lg font-semibold">
                          {barber.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-foreground">
                      {barber.name}
                    </h3>
                    {barber.email && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {barber.email}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {barbershop.name}. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
