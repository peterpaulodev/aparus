'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { createAdminBooking } from '@/app/_actions/create-admin-booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  customerType: z.enum(['existing', 'new']),
  customerId: z.string().optional(),
  newCustomerName: z.string().optional(),
  newCustomerPhone: z.string().optional(),
  serviceId: z.string().min(1, 'Selecione um serviço'),
  barberId: z.string().min(1, 'Selecione um barbeiro'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
}

interface Barber {
  id: string;
  name: string;
}

interface CreateBookingDialogProps {
  customers: Customer[];
  services: Service[];
  barbers: Barber[];
}

export function CreateBookingDialog({
  customers,
  services,
  barbers,
}: CreateBookingDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerType: 'new',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const customerType = watch('customerType');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const result = await createAdminBooking({
        customerId: data.customerType === 'existing' ? data.customerId : undefined,
        newCustomerName: data.customerType === 'new' ? data.newCustomerName : undefined,
        newCustomerPhone: data.customerType === 'new' ? data.newCustomerPhone : undefined,
        serviceId: data.serviceId,
        barberId: data.barberId,
        date: data.date,
        time: data.time,
      });

      if (result.success) {
        toast.success('Agendamento criado com sucesso!');
        setIsOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error('Erro ao criar agendamento', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao criar o agendamento.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Agendamento
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="fixed left-[50%] top-[50%] z-50 max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Novo Agendamento</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="new"
                      {...register('customerType')}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Novo Cliente</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="existing"
                      {...register('customerType')}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Cliente Existente</span>
                  </label>
                </div>
              </div>

              {customerType === 'new' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerName">Nome do Cliente</Label>
                    <Input
                      id="newCustomerName"
                      placeholder="João Silva"
                      {...register('newCustomerName')}
                    />
                    {errors.newCustomerName && (
                      <p className="text-sm text-destructive">
                        {errors.newCustomerName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCustomerPhone">Telefone</Label>
                    <Input
                      id="newCustomerPhone"
                      placeholder="(11) 99999-9999"
                      {...register('newCustomerPhone')}
                    />
                    {errors.newCustomerPhone && (
                      <p className="text-sm text-destructive">
                        {errors.newCustomerPhone.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="customerId">Selecionar Cliente</Label>
                  <select
                    id="customerId"
                    {...register('customerId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecione...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="text-sm text-destructive">{errors.customerId.message}</p>
                  )}
                </div>
              )}

              {/* Serviço */}
              <div className="space-y-2">
                <Label htmlFor="serviceId">Serviço</Label>
                <select
                  id="serviceId"
                  {...register('serviceId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {errors.serviceId && (
                  <p className="text-sm text-destructive">{errors.serviceId.message}</p>
                )}
              </div>

              {/* Barbeiro */}
              <div className="space-y-2">
                <Label htmlFor="barberId">Barbeiro</Label>
                <select
                  id="barberId"
                  {...register('barberId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione...</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
                {errors.barberId && (
                  <p className="text-sm text-destructive">{errors.barberId.message}</p>
                )}
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input id="time" type="time" {...register('time')} />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time.message}</p>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Agendamento'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
