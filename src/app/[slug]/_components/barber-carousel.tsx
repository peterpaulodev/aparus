'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Barber } from "@prisma/client";
import Autoplay from "embla-carousel-autoplay"

interface BarberListProps {
  barbers: Barber[];
}

const AUTOPLAY_DELAY = 2500; // 2.5 segundos

export function BarberCarousel({ barbers }: BarberListProps) {
  const autoplay = Autoplay({
    delay: AUTOPLAY_DELAY,
  });

  return (
    <div className="w-full px-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          autoplay,
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {barbers.map((barber) => (
            <CarouselItem
              key={barber.id}
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4" // Responsividade aqui
            >
              <div className="p-1 h-full">
                <Card className="text-center h-full hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex justify-center">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage
                          src={barber.avatarUrl ?? undefined}
                          alt={barber.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-lg font-semibold bg-secondary text-secondary-foreground">
                          {barber.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-foreground truncate">
                      {barber.name}
                    </h3>
                    {barber.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {barber.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="flex -left-12 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground" />
        <CarouselNext className="flex -right-12 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground" />
      </Carousel>
    </div>
  );
}
