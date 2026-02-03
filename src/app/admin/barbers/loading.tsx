import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header da Lista */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-11 w-52 rounded-md" />
        </div>

        {/* Grid de Barbeiros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col items-center">
              <CardHeader className="flex flex-col items-center space-y-4 pt-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex flex-col items-center space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardHeader>
              <CardContent className="text-center w-full px-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </CardContent>
              <CardFooter className="flex gap-2 w-full px-6 pb-6">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
