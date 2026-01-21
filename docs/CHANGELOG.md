# Changelog

Registo de todas as alterações relevantes do projeto **Aparatus**.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planeado
- Integração WhatsApp para lembretes automáticos
- Portal do cliente (visualizar e cancelar agendamentos)
- Sistema de notificações por email
- Multi-idioma (PT-PT, EN, ES)
- Sistema de pagamentos integrado
- Testes automatizados (unit + E2E)
- CI/CD com GitHub Actions

---

## [0.1.0] - 2026-01-21

### 🎉 Lançamento Inicial (MVP)

Primeira versão funcional do Aparatus com funcionalidades essenciais para gestão de barbearias.

### ✨ Added

#### Autenticação
- Sistema de autenticação via Google OAuth (NextAuth.js)
- Gestão de sessões persistidas em PostgreSQL
- Proteção de rotas administrativas com middleware

#### Sistema Multi-tenant
- Modelo de barbearias identificadas por slug único
- Isolamento completo de dados por tenant
- Páginas públicas de agendamento: `/[slug]`

#### Gestão de Recursos (Admin)
- **Dashboard Analytics:**
  - Métricas financeiras (receita de hoje, mês)
  - Gráfico de receita dos últimos 7 dias (Recharts)
  - Lista de próximos agendamentos
- **Gestão de Barbeiros:**
  - CRUD completo (criar, editar, eliminar)
  - Editor de disponibilidade (horários por dia da semana)
  - Suporte a dois formatos de availability (array e range)
  - Avatares e descrições personalizáveis
- **Gestão de Serviços:**
  - CRUD completo com validação Zod
  - Configuração de preço (Decimal), duração (minutos) e descrição
  - Validação de ownership (apenas dono pode editar)
- **Gestão de Agendamentos:**
  - Visualização por data com filtro
  - Atualização de status (PENDING, CONFIRMED, CANCELED, COMPLETED)
  - Criação de agendamentos pelo admin
  - Listagem de bookings futuros

#### Agendamento Público
- Página pública otimizada para mobile (`/[slug]`)
- Flow de agendamento em 5 etapas:
  1. Selecionar serviço
  2. Selecionar barbeiro
  3. Escolher data (Calendar component)
  4. Escolher horário disponível
  5. Preencher dados de contacto
- Verificação de disponibilidade em tempo real
- Algoritmo inteligente de slots disponíveis:
  - Considera duração do serviço
  - Filtra horários ocupados
  - Suporta múltiplos formatos de availability
  - Exclui bookings cancelados
- Criação automática ou reutilização de customers por telefone
- Toast notifications de sucesso/erro (Sonner)

#### Base de Dados
- Schema Prisma completo com 8 modelos:
  - **Auth:** User, Account, Session, VerificationToken
  - **Business:** Barbershop, Barber, Service, Booking, Customer
- Migrations system configurado
- Seed script com dados de exemplo:
  - 1 Admin user
  - 1 Barbershop (slug: `barbearia-aparatus`)
  - 4 Services (Corte, Barba, Pézinho, Combo)
  - 2 Barbers (com availability)
- Relações bem definidas com Foreign Keys
- Índices únicos (slug, email, sessionToken)

#### UI/UX
- **Design System "Titanium Gold":**
  - Dark mode por defeito
  - Paleta: Charcoal gray + Rich gold
  - High contrast para legibilidade
- **Componentes shadcn/ui:**
  - 16 componentes instalados (Button, Dialog, Calendar, Card, etc)
  - Baseados em Radix UI + Tailwind CSS
  - Totalmente acessíveis (ARIA attributes)
- **Responsividade:**
  - Mobile-first approach
  - Breakpoints otimizados para telemóveis e tablets
  - Touch-friendly buttons e forms
- **Tipografia:**
  - Geist Sans (primary)
  - Geist Mono (monospace)

#### Developer Experience
- TypeScript Strict Mode ativo
- ESLint configurado com regras Next.js
- Prisma Singleton pattern (previne memory leaks)
- Server Actions type-safe com Zod validation
- Helpers utilitários (`formatPrice`, `formatDuration`, `cn`)
- Docker Compose para PostgreSQL local
- Dockerfile multi-stage para produção
- Scripts npm bem organizados

#### Documentação
- README.md profissional com badges e quick start
- Estrutura `/docs` completa:
  - Getting Started (setup detalhado)
  - Architecture (diagramas + padrões)
  - Database (ERD + queries Prisma)
  - API Reference (Server Actions documentadas)
  - Deployment (Vercel + Docker)
  - Contributing (workflow + code standards)
  - Changelog (este ficheiro)
- `.env.example` com todas as variáveis comentadas
- Copilot Instructions (contexto para AI development)

### 🔧 Technical Details

#### Stack
- **Next.js:** 16.1.1 (App Router)
- **React:** 19.2.3
- **TypeScript:** 5.x
- **Prisma:** 6.19.2
- **PostgreSQL:** 16+ (Alpine)
- **NextAuth:** 4.24.13
- **Tailwind CSS:** 4.x
- **Radix UI:** Latest
- **Zod:** 4.3.5
- **date-fns:** 4.1.0
- **Recharts:** 3.6.0

#### Features Técnicas
- React Server Components (RSC) por defeito
- Server Actions para mutações sem API routes
- Experimental React Compiler habilitado
- Standalone build para Docker (~350MB)
- Prisma query logging em desenvolvimento
- Automatic cache revalidation com `revalidatePath`
- Image optimization com Next.js Image component

### 📝 Known Limitations

- Apenas Google OAuth (sem email/password)
- Limitado a 1 barbershop por user (MVP)
- Sem notificações automáticas (WhatsApp/Email)
- Sem portal do cliente (apenas admin)
- Sem sistema de pagamentos
- Sem testes automatizados
- Locale hardcoded (pt-BR) em algumas funções

### 🔒 Security

- Environment variables não commitadas
- Passwords hasheadas pelo NextAuth
- Session-based authentication
- Ownership checks em todas as Server Actions
- SQL injection protection via Prisma (parameterized queries)
- XSS protection via React (auto-escaping)

### 📦 Deployment

- Suporta deploy em Vercel (zero-config)
- Dockerfile otimizado para produção
- Docker Compose para desenvolvimento local
- Compatível com Vercel Postgres, Supabase, Neon
- SSL/TLS via Vercel ou Nginx reverse proxy

---

## Como Usar Este Changelog

### Categorias

- **Added** — Novas funcionalidades
- **Changed** — Alterações em funcionalidades existentes
- **Deprecated** — Funcionalidades que serão removidas
- **Removed** — Funcionalidades removidas
- **Fixed** — Correções de bugs
- **Security** — Correções de vulnerabilidades

### Formato de Versões

`MAJOR.MINOR.PATCH`

- **MAJOR:** Alterações incompatíveis (breaking changes)
- **MINOR:** Novas funcionalidades (backwards compatible)
- **PATCH:** Correções de bugs (backwards compatible)

### Exemplo de Entrada Futura

```markdown
## [0.2.0] - 2026-02-15

### Added
- Integração WhatsApp via Twilio para lembretes automáticos
- Portal do cliente em `/cliente` com autenticação via magic link
- Suporte a múltiplos idiomas (PT-PT, EN, ES)

### Changed
- Algoritmo de disponibilidade agora suporta pausas configuráveis
- Dashboard analytics atualizado com filtros personalizáveis

### Fixed
- Corrigido bug de timezone em agendamentos internacionais
- Resolvido problema de race condition em bookings simultâneos

### Security
- Adicionado rate limiting em rotas públicas (10 req/min)
- Upgrade de dependências com vulnerabilidades (prisma 6.20.0)
```

---

## Links

- [Repositório GitHub](https://github.com/your-username/aparus)
- [Documentação](./README.md)
- [Guia de Contribuição](./CONTRIBUTING.md)

---

<div align="center">

**Acompanha as novidades do Aparatus** 📝

[⬆ Voltar ao topo](#changelog)

</div>
