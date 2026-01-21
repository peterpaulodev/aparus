<div align="center">

# ✂️ Aparatus

**Plataforma SaaS Multi-tenant para Gestão de Barbearias**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Demo](#) • [Documentação](./docs) • [Instalação](#-quick-start) • [Contribuir](./docs/CONTRIBUTING.md)

</div>

---

## 📖 Sobre o Projeto

**Aparatus** é uma solução SaaS moderna e minimalista para gestão de barbearias, com foco em experiência **Mobile-First** e simplicidade de uso. Permite que barbeiros gerem a sua agenda de forma intuitiva e que clientes marquem horários através de um link público simples (estilo "Link na Bio").

Construído com as melhores práticas de desenvolvimento moderno, incluindo **React Server Components**, **TypeScript Strict Mode**, e uma arquitetura **Multi-tenant** baseada em slugs únicos. O sistema oferece verificação de disponibilidade em tempo real, dashboard analítico com métricas financeiras, e autenticação segura via Google OAuth.

---

## ✨ Funcionalidades Principais

- 🗓️ **Sistema de Agendamento Público** — Páginas `/[slug]` personalizadas por barbearia com booking flow otimizado para mobile
- 📊 **Dashboard Analítico** — Métricas financeiras (hoje, mês), gráficos de receita (Recharts), e visualização de próximos agendamentos
- 👥 **Gestão de Barbeiros** — CRUD completo com editor de disponibilidade (horários por dia da semana)
- 💈 **Catálogo de Serviços** — Gestão de serviços com preço, duração e descrição personalizável
- ⏰ **Verificação de Disponibilidade** — Algoritmo inteligente que calcula slots livres em tempo real baseado em duração do serviço
- 🔐 **Autenticação Segura** — NextAuth com Google OAuth e gestão de sessões baseada em Prisma
- 🏢 **Multi-tenant** — Suporte para múltiplas barbearias com isolamento completo de dados via slug único
- 🎨 **Dark Theme "Titanium Gold"** — Interface moderna com paleta de cores profissional (charcoal + gold)

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| **Framework** | [Next.js](https://nextjs.org) (App Router) | 16.1.1 |
| **Linguagem** | [TypeScript](https://typescriptlang.org) | 5.x |
| **Base de Dados** | [PostgreSQL](https://postgresql.org) | 16+ |
| **ORM** | [Prisma](https://prisma.io) | 6.19.2 |
| **Autenticação** | [NextAuth.js](https://next-auth.js.org) | 4.24.13 |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) | Latest |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | 7.71 / 4.3 |
| **Charts** | [Recharts](https://recharts.org) | 3.6.0 |
| **Date Handling** | [date-fns](https://date-fns.org) | 4.1.0 |
| **Icons** | [Lucide React](https://lucide.dev) | 0.562.0 |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski) | 2.0.7 |

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 20+ e **pnpm** 9+
- **PostgreSQL** 16+ (ou Docker)
- **Google Cloud Console** (para OAuth)

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/your-username/aparus.git
cd aparus

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edita .env com as tuas credenciais (ver docs/GETTING_STARTED.md)

# 4. Iniciar PostgreSQL (via Docker)
docker-compose up -d

# 5. Executar migrations e seed
pnpm run db:migrate
pnpm run db:seed

# 6. Iniciar servidor de desenvolvimento
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) e faz login com Google OAuth.

---

## 📋 Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento (porta 3000) |
| `pnpm build` | Cria build de produção (com Prisma generate) |
| `pnpm start` | Inicia servidor de produção |
| `pnpm lint` | Executa ESLint para verificação de código |
| `pnpm db:migrate` | Executa migrations do Prisma |
| `pnpm db:seed` | Popula base de dados com dados de exemplo |
| `docker-compose up` | Inicia PostgreSQL em container Docker |

---

## 📁 Estrutura do Projeto

```
aparus/
├── prisma/
│   ├── schema.prisma          # Schema da base de dados (8 modelos)
│   ├── seed.ts                # Script de seed com dados de exemplo
│   └── migrations/            # Histórico de migrations
├── src/
│   ├── app/
│   │   ├── [slug]/            # Página pública de agendamento (RSC)
│   │   ├── admin/             # Dashboard + CRUD (protegido)
│   │   │   ├── barbers/       # Gestão de barbeiros
│   │   │   ├── services/      # Gestão de serviços
│   │   │   └── bookings/      # Visualização de agendamentos
│   │   ├── _actions/          # Server Actions (lógica de negócio)
│   │   └── api/auth/          # NextAuth API routes
│   ├── components/
│   │   ├── booking-item.tsx   # Flow de agendamento (Client)
│   │   ├── admin/             # Componentes do dashboard
│   │   └── ui/                # shadcn/ui components (16 componentes)
│   ├── lib/
│   │   ├── prisma.ts          # Singleton do Prisma Client
│   │   └── utils.ts           # Helpers (formatPrice, formatDuration)
│   └── assets/                # Logo components (SVG)
├── docs/                      # Documentação completa
│   ├── GETTING_STARTED.md     # Guia de instalação detalhado
│   ├── ARCHITECTURE.md        # Explicação da arquitetura
│   ├── DATABASE.md            # Schema e queries
│   ├── API.md                 # Referência de Server Actions
│   └── DEPLOYMENT.md          # Instruções de deploy
├── docker-compose.yml         # PostgreSQL container
└── .env.example               # Template de variáveis de ambiente
```

---

## 📚 Documentação Completa

A documentação detalhada está organizada na pasta [`/docs`](./docs):

- 📘 [**Getting Started**](./docs/GETTING_STARTED.md) — Setup completo passo-a-passo
- 🏗️ [**Arquitetura**](./docs/ARCHITECTURE.md) — Explicação do design multi-tenant e padrões de código
- 💾 [**Base de Dados**](./docs/DATABASE.md) — Schema Prisma, ERD e queries comuns
- 🔌 [**API Reference**](./docs/API.md) — Documentação de Server Actions
- 🚢 [**Deployment**](./docs/DEPLOYMENT.md) — Guia de deploy em Vercel/Docker
- 🤝 [**Contribuir**](./docs/CONTRIBUTING.md) — Guidelines para contribuições

---

## 🧪 Tecnologias Avançadas

- ⚡ **React Server Components** — Rendering no servidor por defeito para performance máxima
- 🔄 **Server Actions** — Mutações de dados sem API routes explícitas
- 🧬 **React Compiler** — Experimental (babel-plugin-react-compiler)
- 🎯 **Standalone Output** — Build otimizado para Docker (~350MB)
- 🔒 **Prisma Adapter** — Sessões persistidas em PostgreSQL
- 📅 **Smart Availability** — Algoritmo de slots com suporte a durações variáveis

---

## 🗺️ Roadmap (Funcionalidades Futuras)

- [ ] Integração WhatsApp para lembretes automáticos
- [ ] Portal do cliente (visualizar/cancelar agendamentos)
- [ ] Notificações por email
- [ ] Sistema de pagamentos integrado
- [ ] Multi-idioma (i18n)
- [ ] Testes automatizados (unit + E2E)
- [ ] CI/CD com GitHub Actions
- [ ] Métricas avançadas (retenção, serviços populares)

---

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor, lê o [guia de contribuição](./docs/CONTRIBUTING.md) para entender o workflow de desenvolvimento.

---

## 📄 Licença

Este projeto está sob a licença MIT. Ver ficheiro [LICENSE](./LICENSE) para mais detalhes.

---

<div align="center">

**Desenvolvido com ❤️ usando Next.js 16**

[⬆ Voltar ao topo](#-aparatus)

</div>
