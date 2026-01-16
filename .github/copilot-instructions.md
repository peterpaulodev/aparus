# Contexto do Projeto: SaaS de Gestão para Barbearias (Aparatus)

## 1. Visão Geral do Projeto

Estamos a construir uma **Plataforma SaaS Multi-tenant para Barbearias**.
O objetivo é fornecer uma experiência minimalista e "Mobile-First" para que os barbeiros giram a sua agenda e para que os clientes marquem horários através de um link público simples (estilo "Link na Bio").

**Atores Principais:**

- **Barbearia (Tenant):** A empresa/entidade. Identificada por um `slug` único.
- **Barbeiro (User):** O profissional que gere a agenda e atende.
- **Cliente (Customer):** O utilizador final que agenda o serviço (foco total em mobile).

**Funcionalidades Principais (MVP):**

- Página Pública de Agendamento: `/[slug]` (ex: app.com/barbearia-do-ze).
- Dashboard do Barbeiro: Visualização de calendário, gestão de agendamentos.
- Integração WhatsApp: Lembretes automáticos (funcionalidade futura, manter o código extensível).

## 2. Stack Tecnológica & Diretrizes

- **Framework:** Next.js 16+ (App Router). NÃO usar o Pages router.
- **Linguagem:** TypeScript (Modo Strict).
- **Base de Dados:** PostgreSQL.
- **ORM:** Prisma.
- **Estilo:** Tailwind CSS.
- **Componentes UI:** shadcn/ui (baseado em Radix UI).
- **Gestão de Estado:** Usar React Server Components (RSC) para buscar dados. Usar Client Components apenas quando houver interatividade.
- **Formulários:** React Hook Form + Zod para validação.
- **Manipulação de Datas:** date-fns (preferencial para lógica de agendamento).

## 3. Padrões de Código e Boas Práticas

### Next.js App Router

- Usar **Server Components** por defeito. Adicionar `'use client'` apenas no topo de componentes que usem hooks (`useState`, `useEffect`) ou event listeners.
- Usar **Server Actions** para mutações de dados (POST/PUT/DELETE) em vez de API routes, sempre que possível.
- Estrutura de ficheiros: Usar rotas dinâmicas `app/[slug]/...` para a navegação do tenant.

### Base de Dados & Prisma

- Usar sempre o padrão "Prisma Singleton" para evitar múltiplas instâncias de conexão.
- Ao consultar datas, garantir consistência de fuso horário (armazenar em UTC).
- Usar queries relacionais adequadas (`include` ou `select`) para evitar problemas de N+1.

### TypeScript

- Evitar `any`. Definir interfaces/types para todas as props e estruturas de dados.
- Usar esquemas `zod` para validar inputs de API e dados de Formulários.
- Garantir que todas as operações assíncronas de base de dados estão tipadas (ex: `Promise<Booking>`).

### UI/UX (Design System)

- **Mobile First:** Todos os layouts devem ser totalmente responsivos. A visão do cliente é primariamente num telemóvel.
- **Tema:** Dark mode por defeito (estética "Barber").
- **Simplicidade:** Evitar excesso de informação. Botões grandes para toque fácil em ecrãs táteis.

## 4. Contexto do Schema da Base de Dados (Modelos Chave)

Lembra-te destas relações principais:

- `Barbershop` tem muitos `Barbers`, `Services` e `Bookings`.
- `Booking` conecta `Barber`, `Service` e `Customer`.
- O campo `slug` em `Barbershop` é o identificador único para acesso público.

## 5. Tom e Saída

- Sê conciso e técnico.
- Ao gerar código, prioriza a legibilidade e sintaxe moderna (ES6+).
- Comentários no código devem ser em Português para explicar a lógica complexa.
