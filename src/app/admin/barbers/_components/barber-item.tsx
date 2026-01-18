'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { deleteBarber } from '@/app/_actions/manage-barbers';
import { AvailabilityDialog } from './availability-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Barber {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  availability?: Record<string, unknown>;
}

interface BarberItemProps {
  barber: Barber;
  onEdit: (barber: Barber) => void;
}

export function BarberItem({ barber, onEdit }: BarberItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteBarber({ id: barber.id });

      if (result.success) {
        toast.success('Barbeiro excluído com sucesso!', {
          description: `O barbeiro "${barber.name}" foi removido da equipe.`,
        });

        // Fechar o dialog de confirmação
        setShowConfirmDialog(false);

        // Atualizar a página
        router.refresh();
      } else {
        toast.error('Erro ao excluir barbeiro', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao excluir barbeiro:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao excluir o barbeiro. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={barber.avatarUrl || undefined} alt={barber.name} />
            <AvatarFallback>{getInitials(barber.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{barber.name}</CardTitle>
            <CardDescription>
              {barber.description || 'Sem descrição'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAvailabilityDialog(true)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Horários
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(barber)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => !isDeleting && setShowConfirmDialog(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" />

          {/* Dialog */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg">
            <div onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold">Confirmar Exclusão</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Tem certeza que deseja excluir o barbeiro{' '}
                  <span className="font-semibold">{barber.name}</span> da equipe?
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir Barbeiro'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Disponibilidade */}
      <AvailabilityDialog
        barber={barber}
        open={showAvailabilityDialog}
        onOpenChange={setShowAvailabilityDialog}
      />
    </>
  );
}
