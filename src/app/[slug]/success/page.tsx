import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, CalendarCheck, MapPin, Phone, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SuccessPageProps {
  searchParams: Promise<{
    bookingId?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    redirect("/");
  }

  // Buscar detalhes do agendamento
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      service: true,
      barber: true,
      barbershop: true,
    },
  });

  if (!booking) {
    redirect("/");
  }

  // Formatação de Datas e Textos
  const bookingDate = new Date(booking.date);
  const formattedDate = format(bookingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedTime = format(bookingDate, "HH:mm");

  // Limpar telefone da barbearia para o link (apenas números)
  const barbershopPhoneClean = booking.barbershop.phone?.replace(/\D/g, "") || "";

  // Mensagem para o WhatsApp do Barbeiro
  const whatsappMessage = `Olá! Acabei de agendar um serviço de *${booking.service.name}* com o(a) *${booking.barber.name}* para dia *${formattedDate} às ${formattedTime}*. Aguardo a confirmação!`;

  const whatsappUrl = `https://wa.me/55${barbershopPhoneClean}?text=${encodeURIComponent(whatsappMessage)}`;

  // Link do Google Calendar
  // Formato: YYYYMMDDTHHmmssZ
  const startTime = bookingDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endDate = new Date(bookingDate.getTime() + booking.service.duration * 60000);
  const endTime = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Corte+na+${encodeURIComponent(booking.barbershop.name)}&dates=${startTime}/${endTime}&details=Serviço:+${encodeURIComponent(booking.service.name)}+com+${encodeURIComponent(booking.barber.name)}&location=${encodeURIComponent(booking.barbershop.address || "")}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border shadow-2xl bg-card">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pt-10 pb-2">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-300" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Agendamento Confirmado!</h1>
            <p className="text-muted-foreground text-sm">
              Seu horário foi reservado com sucesso.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Card de Detalhes */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-4 border border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profissional</span>
              <span className="font-semibold">{booking.barber.name}</span>
            </div>
            <Separator className="bg-border/50" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Serviço</span>
              <span className="font-semibold">{booking.service.name}</span>
            </div>
            <Separator className="bg-border/50" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Data e Hora</span>
              <div className="text-right">
                <div className="font-semibold">{formattedDate}</div>
                <div className="text-xs text-muted-foreground">{formattedTime}h</div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          {booking.barbershop.address && (
            <div className="flex items-start gap-3 text-sm text-muted-foreground px-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{booking.barbershop.address}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8">
          {/* Botão WhatsApp (Verde Oficial) */}
          {booking.barbershop.phone && (
            <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-12">
              <Link href={whatsappUrl} target="_blank">
                <Phone className="mr-2 h-5 w-5" />
                Confirmar via WhatsApp
              </Link>
            </Button>
          )}

          {/* Botão Google Calendar */}
          <Button asChild variant="outline" className="w-full h-12 border-primary/20 hover:bg-primary/5 hover:text-primary">
            <Link href={googleCalendarUrl} target="_blank">
              <CalendarCheck className="mr-2 h-5 w-5" />
              Adicionar à Agenda
            </Link>
          </Button>

          {/* Voltar */}
          <Button asChild variant="ghost" className="w-full mt-2">
            <Link href={`/${booking.barbershop.slug}`}>
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Voltar para a Barbearia
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}