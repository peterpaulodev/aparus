'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { createBarbershop } from '@/app/_actions/create-barbershop';
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
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres'),
  slug: z
    .string()
    .min(2, 'O link deve ter pelo menos 2 caracteres')
    .max(50, 'O link não pode exceder 50 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'O link deve conter apenas letras minúsculas, números e hífens'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateBarbershopForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  // Função para gerar slug a partir do nome
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD') // Normaliza caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-'); // Remove hífens duplicados
  };

  // Observa mudanças no campo 'name' para atualizar o slug automaticamente
  const handleNameChange = (name: string) => {
    const currentSlug = form.getValues('slug');

    // Só atualiza o slug automaticamente se ele estiver vazio ou ainda não foi editado manualmente
    if (!currentSlug || currentSlug === generateSlug(form.getValues('name'))) {
      form.setValue('slug', generateSlug(name));
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const result = await createBarbershop(values);

      if (result.success) {
        toast.success('Barbearia criada com sucesso!', {
          description: `Acesse em: aparatus.com/${result.slug}`,
        });

        // Atualiza a página para mostrar a nova barbearia
        router.refresh();
      } else {
        // Se houver erro em um campo específico, mostra no campo
        if (result.field) {
          form.setError(result.field as 'name' | 'slug', {
            message: result.error,
          });
        }

        // Também mostra no toast
        toast.error('Erro ao criar barbearia', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao criar barbearia:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao criar a barbearia. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo: Nome da Barbearia */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Barbearia</FormLabel>
              <FormControl>
                <Input
                  placeholder="Barbearia do Zé"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleNameChange(e.target.value);
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo: Link Personalizado (Slug) */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Personalizado</FormLabel>
              <FormControl>
                <Input
                  placeholder="barbearia-do-ze"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Seu link será:{' '}
                <span className="font-medium text-foreground">
                  aparatus.com/{field.value || 'seu-link'}
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botão Submit */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Barbearia'
          )}
        </Button>
      </form>
    </Form>
  );
}
