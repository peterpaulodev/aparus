'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { upsertService } from '@/app/_actions/manage-services';
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
  price: z
    .string()
    .min(1, 'O preço é obrigatório')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      'O preço deve ser maior ou igual a zero'
    ),
  duration: z
    .string()
    .min(1, 'A duração é obrigatória')
    .refine(
      (val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 1 && num <= 480;
      },
      'A duração deve estar entre 1 e 480 minutos'
    ),
  description: z
    .string()
    .max(500, 'A descrição não pode exceder 500 caracteres')
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
}

interface SaveServiceDialogProps {
  service?: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveServiceDialog({
  service,
  open,
  onOpenChange,
}: SaveServiceDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: service?.id || undefined,
      name: service?.name || '',
      price: service?.price?.toString() || '',
      duration: service?.duration?.toString() || '',
      description: service?.description || '',
    },
  });

  // Atualizar o form quando o serviço mudar (modo edição)
  useEffect(() => {
    if (service) {
      form.reset({
        id: service.id,
        name: service.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
        description: service.description || '',
      });
    } else {
      form.reset({
        id: undefined,
        name: '',
        price: '',
        duration: '',
        description: '',
      });
    }
  }, [service, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      // Converter strings para números antes de enviar
      const result = await upsertService({
        id: values.id,
        name: values.name,
        price: parseFloat(values.price),
        duration: parseInt(values.duration),
        description: values.description || undefined,
      });

      if (result.success) {
        toast.success(
          service ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!',
          {
            description: `O serviço "${values.name}" foi ${service ? 'atualizado' : 'criado'}.`,
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
        toast.error('Erro ao salvar serviço', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao salvar o serviço. Tente novamente.',
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
              {service ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {service
                ? 'Atualize as informações do serviço'
                : 'Adicione um novo serviço à sua barbearia'}
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
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Corte de Cabelo"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos: Preço e Duração (lado a lado) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Campo: Preço */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="35.00"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo: Duração */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="480"
                          placeholder="30"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campo: Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Corte tradicional com máquina e tesoura"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Descrição opcional do serviço
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
                  ) : service ? (
                    'Atualizar Serviço'
                  ) : (
                    'Criar Serviço'
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
