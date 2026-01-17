'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { upsertBarber } from '@/app/_actions/manage-barbers';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Schema de validação (deve corresponder ao da Server Action)
const formSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres'),
  description: z
    .string()
    .max(500, 'A descrição não pode exceder 500 caracteres')
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Barber {
  id: string;
  name: string;
  description: string | null;
}

interface SaveBarberDialogProps {
  barber?: Barber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveBarberDialog({
  barber,
  open,
  onOpenChange,
}: SaveBarberDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: barber?.id || undefined,
      name: barber?.name || '',
      description: barber?.description || '',
    },
  });

  // Atualizar o form quando o barbeiro mudar (modo edição)
  useEffect(() => {
    if (barber) {
      form.reset({
        id: barber.id,
        name: barber.name,
        description: barber.description || '',
      });
    } else {
      form.reset({
        id: undefined,
        name: '',
        description: '',
      });
    }
  }, [barber, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const result = await upsertBarber({
        id: values.id,
        name: values.name,
        description: values.description || undefined,
      });

      if (result.success) {
        toast.success(
          barber ? 'Barbeiro atualizado com sucesso!' : 'Barbeiro criado com sucesso!',
          {
            description: `O barbeiro "${values.name}" foi ${barber ? 'atualizado' : 'criado'}.`,
          }
        );

        // Fechar o dialog
        onOpenChange(false);

        // Resetar o formulário
        form.reset();

        // Atualizar a página
        router.refresh();
      } else {
        // Se houver erro em um campo específico, mostra no campo
        if (result.field) {
          form.setError(result.field as keyof FormValues, {
            message: result.error,
          });
        }

        // Também mostra no toast
        toast.error('Erro ao salvar barbeiro', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar barbeiro:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao salvar o barbeiro. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg">
        <div onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {barber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {barber
                ? 'Atualize as informações do barbeiro'
                : 'Adicione um novo barbeiro à sua barbearia'}
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo: Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Barbeiro</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="João Silva"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo: Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição / Especialidade</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Especialista em cortes clássicos e barba"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Descrição opcional sobre o barbeiro
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : barber ? (
                    'Atualizar Barbeiro'
                  ) : (
                    'Criar Barbeiro'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
