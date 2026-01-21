# 🔌 API Reference — Aparatus

Documentação completa das **Server Actions** disponíveis no Aparatus, organizadas por domínio, com TypeScript signatures, Zod schemas e exemplos de uso.

---

## 📋 Índice

1. [Introdução](#-introdução)
2. [Booking Management](#-booking-management)
3. [Resource Management](#-resource-management)
4. [Analytics](#-analytics)
5. [Error Handling](#-error-handling)
6. [Boas Práticas](#-boas-práticas)

---

## 🎯 Introdução

O **Aparatus** utiliza **Next.js Server Actions** para todas as mutações de dados, eliminando a necessidade de API routes explícitas. Todas as Server Actions:

- ✅ São **type-safe** (input e output totalmente tipados)
- ✅ Validam dados com **Zod schemas**
- ✅ Executam no **servidor** (sem exposição de lógica ao cliente)
- ✅ Integram nativamente com `useTransition` para UX progressiva
- ✅ Invalidam caches automaticamente com `revalidatePath`

### Localização

Todas as Server Actions estão em: `src/app/_actions/`

### Estrutura de Retorno Padrão

```typescript
type ActionResult<T> =
  | { success: true; data?: T }
  | { success: false; error: string; field?: string };
```

---

## 📅 Booking Management

Server Actions relacionadas com agendamentos.

---

### 1. saveBooking

**Descrição:** Cria um novo agendamento na página pública (não requer autenticação).

**Ficheiro:** [`src/app/_actions/save-booking.ts`](../src/app/_actions/save-booking.ts)

**Assinatura TypeScript:**

```typescript
type SaveBookingParams = {
  barbershopId: string;
  serviceId: string;
  barberId: string;
  date: Date;
  customerName: string;
  customerPhone: string;
};

type SaveBookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

function saveBooking(params: SaveBookingParams): Promise<SaveBookingResult>;
```

**Validações:**

1. Campos obrigatórios (`barbershopId`, `serviceId`, `barberId`, `customerName`, `customerPhone`)
2. Data não pode ser no passado
3. Telefone é normalizado (remove caracteres especiais)
4. Horário deve estar disponível (chama `getAvailableTimes` internamente)
5. Verifica conflitos de horário com bookings existentes

**Lógica de Customer:**

- Se já existe um cliente com o mesmo telefone naquela barbearia → **reutiliza**
- Se não existe → **cria novo customer**

**Exemplo de Uso:**

```typescript
'use client';
import { saveBooking } from '@/app/_actions/save-booking';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function BookingForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
      barbershopId: formData.get('barbershopId') as string,
      serviceId: formData.get('serviceId') as string,
      barberId: formData.get('barberId') as string,
      date: new Date(formData.get('date') as string),
      customerName: formData.get('name') as string,
      customerPhone: formData.get('phone') as string,
    };

    startTransition(async () => {
      const result = await saveBooking(data);

      if (result.success) {
        toast.success('Agendamento criado com sucesso!');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit}>
      {/* inputs */}
      <button disabled={isPending}>
        {isPending ? 'A agendar...' : 'Confirmar'}
      </button>
    </form>
  );
}
```

**Revalidações:**
- `revalidatePath('/admin/bookings')`
- `revalidatePath(`/${barbershop.slug}`)`

---

### 2. getAvailableTimes

**Descrição:** Retorna horários disponíveis de um barbeiro numa data específica, considerando duração do serviço e bookings existentes.

**Ficheiro:** [`src/app/_actions/get-available-times.ts`](../src/app/_actions/get-available-times.ts)

**Assinatura TypeScript:**

```typescript
interface GetAvailableTimesParams {
  barberId: string;
  date: Date;
  serviceDuration: number; // minutos
}

interface GetAvailableTimesResult {
  success: boolean;
  times?: string[]; // ["09:00", "09:45", "10:30"]
  error?: string;
}

function getAvailableTimes(
  params: GetAvailableTimesParams
): Promise<GetAvailableTimesResult>;
```

**Algoritmo:**

1. Busca barbeiro e a sua `availability` (campo JSON)
2. Identifica o dia da semana (`monday`, `tuesday`, etc.)
3. Suporta **dois formatos** de availability:

**Formato A: Array de horários predefinidos**
```json
{
  "monday": ["09:00", "09:45", "10:30", "11:15"]
}
```

**Formato B: Range de horários (start/end)**
```json
{
  "monday": { "available": true, "start": "09:00", "end": "18:00" }
}
```

4. Gera slots disponíveis baseado no `serviceDuration`
5. Busca bookings existentes no dia (exceto `CANCELED`)
6. Remove slots que causariam overlap com bookings existentes
7. Retorna array de strings no formato `HH:mm`

**Exemplo de Uso:**

```typescript
'use client';
import { getAvailableTimes } from '@/app/_actions/get-available-times';
import { useState, useEffect } from 'react';

export function TimeSelector({ barberId, date, serviceDuration }) {
  const [times, setTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!barberId || !date) return;

    setLoading(true);
    getAvailableTimes({ barberId, date, serviceDuration })
      .then(result => {
        if (result.success && result.times) {
          setTimes(result.times);
        }
      })
      .finally(() => setLoading(false));
  }, [barberId, date, serviceDuration]);

  return (
    <div>
      {loading ? (
        <p>A carregar horários...</p>
      ) : (
        times.map(time => <button key={time}>{time}</button>)
      )}
    </div>
  );
}
```

**Casos Especiais:**

- Se `availability` não está configurado → Retorna erro
- Se dia da semana não tem config → Retorna array vazio `[]`
- Se `available: false` (Formato B) → Retorna array vazio
- Se todos os slots estão ocupados → Retorna array vazio

---

### 3. updateBookingStatus

**Descrição:** Atualiza o status de um agendamento (apenas admin autenticado).

**Ficheiro:** [`src/app/_actions/update-booking-status.ts`](../src/app/_actions/update-booking-status.ts)

**Assinatura TypeScript:**

```typescript
type UpdateBookingStatusInput = {
  bookingId: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED' | 'COMPLETED';
};

type UpdateBookingStatusResult =
  | { success: true }
  | { success: false; error: string };

function updateBookingStatus(
  input: UpdateBookingStatusInput
): Promise<UpdateBookingStatusResult>;
```

**Schema Zod:**

```typescript
const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, 'ID do agendamento é obrigatório'),
  status: z.enum(['CONFIRMED', 'PENDING', 'CANCELED', 'COMPLETED'], {
    message: 'Status inválido',
  }),
});
```

**Validações:**

1. Utilizador deve estar autenticado (verifica `session`)
2. Validação Zod do input
3. Booking deve existir
4. **Ownership check:** Apenas o dono da barbearia pode atualizar

**Exemplo de Uso:**

```typescript
'use client';
import { updateBookingStatus } from '@/app/_actions/update-booking-status';
import { toast } from 'sonner';

export function BookingActions({ bookingId }) {
  async function handleComplete() {
    const result = await updateBookingStatus({
      bookingId,
      status: 'COMPLETED'
    });

    if (result.success) {
      toast.success('Agendamento marcado como concluído!');
    } else {
      toast.error(result.error);
    }
  }

  async function handleCancel() {
    const result = await updateBookingStatus({
      bookingId,
      status: 'CANCELED'
    });

    if (result.success) {
      toast.success('Agendamento cancelado');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <button onClick={handleComplete}>Concluir</button>
      <button onClick={handleCancel}>Cancelar</button>
    </>
  );
}
```

**Revalidações:**
- `revalidatePath('/admin')`
- `revalidatePath('/admin/bookings')`
- `revalidatePath(`/${barbershop.slug}`)`

---

### 4. createAdminBooking

**Descrição:** Cria agendamento pelo admin (com customer existente ou novo).

**Ficheiro:** [`src/app/_actions/create-admin-booking.ts`](../src/app/_actions/create-admin-booking.ts)

**Assinatura TypeScript:**

```typescript
type CreateAdminBookingInput = {
  customerId?: string;           // Se customer já existe
  newCustomerName?: string;      // Se customer novo
  newCustomerPhone?: string;     // Se customer novo
  serviceId: string;
  barberId: string;
  date: string;  // "2026-01-25"
  time: string;  // "14:30"
};

type CreateAdminBookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

function createAdminBooking(
  input: CreateAdminBookingInput
): Promise<CreateAdminBookingResult>;
```

**Schema Zod:**

```typescript
const createAdminBookingSchema = z.object({
  customerId: z.string().optional(),
  newCustomerName: z.string().optional(),
  newCustomerPhone: z.string().optional(),
  serviceId: z.string().min(1, 'Serviço é obrigatório'),
  barberId: z.string().min(1, 'Barbeiro é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
});
```

**Lógica:**

1. Verifica autenticação
2. Valida que `serviceId` e `barberId` pertencem à barbearia do user
3. **Se `customerId` fornecido:** Usa customer existente
4. **Se `newCustomerName` fornecido:** Cria novo customer
5. Combina `date` + `time` em DateTime completo
6. Cria booking com status `CONFIRMED`

**Exemplo de Uso:**

```typescript
// Criar com customer existente
const result = await createAdminBooking({
  customerId: 'uuid-do-customer',
  serviceId: 'uuid-do-service',
  barberId: 'uuid-do-barber',
  date: '2026-01-25',
  time: '14:30'
});

// Criar com customer novo
const result = await createAdminBooking({
  newCustomerName: 'João Silva',
  newCustomerPhone: '912345678',
  serviceId: 'uuid-do-service',
  barberId: 'uuid-do-barber',
  date: '2026-01-25',
  time: '14:30'
});
```

**Revalidações:**
- `revalidatePath('/admin/bookings')`

---

## 🏢 Resource Management

Server Actions para gestão de recursos (Barbershop, Barbers, Services).

---

### 5. createBarbershop

**Descrição:** Cria uma nova barbearia e serviços padrão para o utilizador autenticado.

**Ficheiro:** [`src/app/_actions/create-barbershop.ts`](../src/app/_actions/create-barbershop.ts)

**Assinatura TypeScript:**

```typescript
type CreateBarbershopInput = {
  name: string;
  slug: string;
};

type CreateBarbershopResult =
  | { success: true; barbershopId: string }
  | { success: false; error: string; field?: string };

function createBarbershop(
  input: CreateBarbershopInput
): Promise<CreateBarbershopResult>;
```

**Schema Zod:**

```typescript
const createBarbershopSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z
    .string()
    .min(3, 'URL deve ter pelo menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'URL deve conter apenas letras minúsculas, números e hífens')
    .transform(val => val.toLowerCase()),
});
```

**Lógica:**

1. Verifica se user já tem uma barbearia (limite: 1 por user no MVP)
2. Valida unicidade do slug
3. Cria barbearia com `ownerId = session.user.id`
4. Cria **3 serviços padrão:**
   - Corte Clássico (€45, 45min)
   - Barba Completa (€35, 30min)
   - Combo Completo (€70, 60min)

**Exemplo de Uso:**

```typescript
const result = await createBarbershop({
  name: 'Barbearia do Zé',
  slug: 'barbearia-do-ze'
});

if (result.success) {
  // Redirecionar para /admin
}
```

**Revalidações:**
- `revalidatePath('/admin')`

---

### 6. upsertBarber

**Descrição:** Cria ou atualiza um barbeiro.

**Ficheiro:** [`src/app/_actions/manage-barbers.ts`](../src/app/_actions/manage-barbers.ts)

**Assinatura TypeScript:**

```typescript
type UpsertBarberInput = {
  id?: string;
  name: string;
  description?: string;
};

type BarberResult =
  | { success: true; barberId: string }
  | { success: false; error: string; field?: string };

function upsertBarber(input: UpsertBarberInput): Promise<BarberResult>;
```

**Schema Zod:**

```typescript
const upsertBarberSchema = z.object({
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
```

**Lógica:**

1. **Create:** Se `id` não fornecido → Cria com `DEFAULT_AVAILABILITY`
2. **Update:** Se `id` fornecido → Atualiza campos (availability mantida)

**DEFAULT_AVAILABILITY:**
```json
{
  "monday": { "available": true, "start": "09:00", "end": "18:00" },
  "tuesday": { "available": true, "start": "09:00", "end": "18:00" },
  "wednesday": { "available": true, "start": "09:00", "end": "18:00" },
  "thursday": { "available": true, "start": "09:00", "end": "18:00" },
  "friday": { "available": true, "start": "09:00", "end": "18:00" },
  "saturday": { "available": false },
  "sunday": { "available": false }
}
```

**Exemplo de Uso:**

```typescript
// Criar barbeiro novo
const result = await upsertBarber({
  name: 'João Navalha',
  description: 'Especialista em cortes clássicos'
});

// Atualizar barbeiro existente
const result = await upsertBarber({
  id: 'uuid-do-barber',
  name: 'João Navalha Silva',
  description: 'Especialista em cortes clássicos e barbas'
});
```

**Revalidações:**
- `revalidatePath('/admin/barbers')`
- `revalidatePath(`/${barbershop.slug}`)`

---

### 7. deleteBarber

**Descrição:** Remove um barbeiro (verifica se não tem bookings futuros).

**Ficheiro:** [`src/app/_actions/manage-barbers.ts`](../src/app/_actions/manage-barbers.ts)

**Assinatura TypeScript:**

```typescript
type DeleteBarberInput = {
  id: string;
};

type DeleteResult =
  | { success: true }
  | { success: false; error: string };

function deleteBarber(input: DeleteBarberInput): Promise<DeleteResult>;
```

**Validações:**

1. Barber existe
2. Barber pertence à barbearia do user autenticado
3. **Soft check:** Se tem bookings com status `PENDING` ou `CONFIRMED` → Bloqueia delete
4. Se OK → Hard delete (remove da DB)

**Exemplo de Uso:**

```typescript
const result = await deleteBarber({ id: 'uuid-do-barber' });

if (!result.success) {
  toast.error(result.error); // "Não é possível eliminar..."
}
```

---

### 8. upsertService

**Descrição:** Cria ou atualiza um serviço.

**Ficheiro:** [`src/app/_actions/manage-services.ts`](../src/app/_actions/manage-services.ts)

**Assinatura TypeScript:**

```typescript
type UpsertServiceInput = {
  id?: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
};

type ServiceResult =
  | { success: true; serviceId: string }
  | { success: false; error: string; field?: string };

function upsertService(input: UpsertServiceInput): Promise<ServiceResult>;
```

**Schema Zod:**

```typescript
const upsertServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(100),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  duration: z.coerce.number().int().positive('Duração deve ser maior que zero'),
  description: z.string().max(500).optional(),
});
```

**Exemplo de Uso:**

```typescript
const result = await upsertService({
  name: 'Corte + Barba',
  price: 70,
  duration: 60,
  description: 'Corte completo com acabamento de barba'
});
```

**Revalidações:**
- `revalidatePath('/admin/services')`
- `revalidatePath(`/${barbershop.slug}`)`

---

### 9. deleteService

**Descrição:** Remove um serviço (similar ao `deleteBarber`).

**Validações:** Bloqueia se houver bookings futuros.

---

## 📊 Analytics

### 10. getDashboardMetrics

**Descrição:** Retorna métricas financeiras e dados para gráficos.

**Ficheiro:** [`src/app/_actions/get-dashboard-metrics.ts`](../src/app/_actions/get-dashboard-metrics.ts)

**Assinatura TypeScript:**

```typescript
type DashboardMetrics = {
  todayRevenue: number;
  monthRevenue: number;
  monthBookingsCount: number;
  last7DaysData: Array<{
    date: string;  // "21 Jan"
    revenue: number;
  }>;
  upcomingBookings: Array<{
    id: string;
    date: Date;
    customer: { name: string };
    service: { name: string; price: Decimal };
    barber: { name: string };
  }>;
};

function getDashboardMetrics(): Promise<DashboardMetrics>;
```

**Lógica:**

1. Calcula receita de **hoje** (status: `COMPLETED`)
2. Calcula receita do **mês atual**
3. Conta total de agendamentos do mês
4. Gera dados dos últimos 7 dias para Recharts
5. Busca próximos 5 bookings (ordenados por data)

**Exemplo de Uso (Server Component):**

```typescript
// app/admin/page.tsx
import { getDashboardMetrics } from '@/app/_actions/get-dashboard-metrics';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <Card>
        <h3>Receita Hoje</h3>
        <p>{formatPrice(metrics.todayRevenue)}</p>
      </Card>
      
      <OverviewChart data={metrics.last7DaysData} />
      
      <BookingsList bookings={metrics.upcomingBookings} />
    </div>
  );
}
```

---

## ⚠️ Error Handling

### Estrutura de Erros

Todas as Server Actions retornam:

```typescript
type Result<T> =
  | { success: true; data?: T }
  | { success: false; error: string; field?: string };
```

### Tipos de Erros

1. **Validação Zod:**
   ```typescript
   { success: false, error: 'Nome deve ter pelo menos 2 caracteres', field: 'name' }
   ```

2. **Autenticação:**
   ```typescript
   { success: false, error: 'Você precisa estar autenticado' }
   ```

3. **Autorização (Ownership):**
   ```typescript
   { success: false, error: 'Você não tem permissão para atualizar este agendamento' }
   ```

4. **Business Logic:**
   ```typescript
   { success: false, error: 'Este horário não está mais disponível' }
   ```

5. **Database/Uncaught:**
   ```typescript
   { success: false, error: 'Erro ao salvar. Tente novamente.' }
   ```

### Tratamento no Cliente

```typescript
'use client';
import { toast } from 'sonner';

async function handleAction() {
  const result = await someServerAction(data);

  if (result.success) {
    toast.success('Ação concluída!');
    // Reset form, redirect, etc
  } else {
    toast.error(result.error);
    
    // Se houver field específico, destacar no form
    if (result.field) {
      setError(result.field, { message: result.error });
    }
  }
}
```

---

## ✅ Boas Práticas

### 1. Usar useTransition para UX Progressiva

```typescript
'use client';
import { useTransition } from 'react';

export function MyForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await serverAction(formData);
      // ...
    });
  }

  return (
    <button disabled={isPending}>
      {isPending ? 'A guardar...' : 'Guardar'}
    </button>
  );
}
```

### 2. Validar no Cliente (Opcional, mas recomendado)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(2)
});

const form = useForm({
  resolver: zodResolver(formSchema)
});
```

### 3. Revalidate Paths Relevantes

```typescript
revalidatePath('/admin');           // Dashboard
revalidatePath('/admin/bookings');  // Lista de bookings
revalidatePath(`/${slug}`);         // Página pública
```

### 4. Log Errors (Produção)

```typescript
catch (error) {
  console.error('[saveBooking]', error); // ✅ Namespace no log
  // Enviar para Sentry, LogRocket, etc
  return { success: false, error: 'Erro interno' };
}
```

---

<div align="center">

**API type-safe e robusta com Server Actions** 🔌

[⬆ Voltar ao topo](#-api-reference--aparatus) • [📚 Documentação](./README.md)

</div>
