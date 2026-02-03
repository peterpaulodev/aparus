"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WhatsAppButtonProps {
  customerName: string;
  phone: string;
  daysSinceLastVisit: number | null;
  barbershopName: string;
  barbershopSlug: string;
}

/**
 * Limpa o telefone e garante o formato para API do WhatsApp
 */
function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  // Se já tem 55 no início, retorna limpo, senão adiciona
  return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
}

/**
 * Gera mensagem contextual baseada no histórico do cliente
 */
function getWhatsAppMessage(
  customerName: string,
  daysSinceLastVisit: number | null,
  barbershopName: string,
  barbershopSlug: string,
): string {
  const firstName = customerName.split(" ")[0];
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const bookingUrl = `${baseUrl}/${barbershopSlug}`;

  // Cliente "Sumido" (>30 dias ou sem visita)
  if (daysSinceLastVisit === null || daysSinceLastVisit > 30) {
    return `Fala, ${firstName}! Aqui é da ${barbershopName} 💈\nFaz um tempo que você não aparece. Que tal renovar o visual essa semana? ✂️\n\nSegue o link para agendar 👉 ${bookingUrl}`;
  }

  // Cliente "Ativo" (≤30 dias)
  return `E aí ${firstName}, tudo certo? Aqui é da ${barbershopName} 💈\nBora manter o corte em dia? Já quer garantir seu horário? ✂️\n\nClica aqui 👉 ${bookingUrl}`;
}

export function WhatsAppButton({
  customerName,
  barbershopName,
  barbershopSlug,
  phone,
  daysSinceLastVisit,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const message = getWhatsAppMessage(
      customerName,
      daysSinceLastVisit,
      barbershopName,
      barbershopSlug,
    );

    const params = new URLSearchParams({
      phone: formattedPhone,
      text: message,
    });

    const whatsappUrl = `https://api.whatsapp.com/send?${params.toString()}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="hover:bg-green-500/10 hover:text-green-500 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="sr-only">Enviar mensagem no WhatsApp</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enviar mensagem no WhatsApp</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
