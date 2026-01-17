'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { deleteService } from '@/app/_actions/manage-services';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatPrice, formatDuration } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
}

interface ServiceItemProps {
  service: Service;
  onEdit: (service: Service) => void;
}

export function ServiceItem({ service, onEdit }: ServiceItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteService({ id: service.id });

      if (result.success) {
        toast.success('Serviço excluído com sucesso!', {
          description: `O serviço "${service.name}" foi removido.`,
        });

        // Fechar o dialog de confirmação
        setShowConfirmDialog(false);

        // Atualizar a página
        router.refresh();
      } else {
        toast.error('Erro ao excluir serviço', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao excluir o serviço. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
          <CardDescription>
            {service.description || 'Sem descrição'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do Serviço */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {formatPrice(Number(service.price))}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(service.duration)}
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(service)}
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
                  Tem certeza que deseja excluir o serviço{' '}
                  <span className="font-semibold">{service.name}</span>? Esta
                  ação não pode ser desfeita.
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
                    'Excluir Serviço'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
