# 📚 Documentação do Aparatus

Bem-vindo à documentação oficial do **Aparatus** — Plataforma SaaS Multi-tenant para Gestão de Barbearias.

---

## 📖 Índice Geral

### 🚀 Setup e Instalação

- [**Getting Started**](./GETTING_STARTED.md) — Guia completo de instalação e configuração inicial
  - Pré-requisitos (Node.js, PostgreSQL, Docker)
  - Instalação passo-a-passo
  - Configuração de variáveis de ambiente
  - Setup da base de dados (Prisma migrate e seed)
  - Troubleshooting de problemas comuns

### 💻 Desenvolvimento

- [**Arquitetura**](./ARCHITECTURE.md) — Design e padrões do sistema
  - Diagrama da arquitetura multi-tenant
  - Explicação do modelo slug-based
  - Fluxo de dados (RSC → Server Actions → Prisma → PostgreSQL)
  - Estrutura de pastas detalhada
  - Padrões de código (Server Components, Client Components, Server Actions)
  - Boas práticas de TypeScript

- [**Base de Dados**](./DATABASE.md) — Schema e queries
  - Diagrama ERD (Entity-Relationship Diagram)
  - Explicação de cada modelo (Barbershop, Barber, Service, Booking, Customer, User)
  - Relações entre entidades
  - Queries comuns com exemplos Prisma
  - Migrations e seeds

- [**API Reference**](./API.md) — Server Actions disponíveis
  - Booking Management (saveBooking, getAvailableTimes, updateBookingStatus, createAdminBooking)
  - Resource Management (createBarbershop, upsertBarber, upsertService, deleteBarber, deleteService)
  - Analytics (getDashboardMetrics)
  - Schemas de validação Zod
  - Exemplos de uso
  - Tratamento de erros

### 🚢 Deploy e Produção

- [**Deployment**](./DEPLOYMENT.md) — Guia de deploy
  - Deploy em Vercel (recomendado)
  - Configuração de variáveis de ambiente em produção
  - Setup do PostgreSQL em cloud (Supabase, Neon, Vercel Postgres)
  - Deploy self-hosted com Docker
  - Checklist pré-deploy
  - Monitorização e logs

### 🤝 Contribuição

- [**Contributing**](./CONTRIBUTING.md) — Como contribuir para o projeto
  - Workflow de desenvolvimento (fork, branch, PR)
  - Padrões de commits (Conventional Commits)
  - Code review process
  - Coding standards e linting
  - Referência ao copilot-instructions.md

- [**Changelog**](./CHANGELOG.md) — Histórico de versões
  - Registo de alterações por versão (formato Keep a Changelog)
  - Notas de release

---

## 🎯 Guias Rápidos

### Para Novos Developers

1. Lê o [**Getting Started**](./GETTING_STARTED.md) para configurar o ambiente local
2. Estuda a [**Arquitetura**](./ARCHITECTURE.md) para entender o design do sistema
3. Consulta a [**API Reference**](./API.md) para perceber como interagir com os dados
4. Revê o [**Contributing**](./CONTRIBUTING.md) antes de criar o primeiro PR

### Para Deployment

1. Lê o [**Deployment Guide**](./DEPLOYMENT.md) completo
2. Configura as variáveis de ambiente no provider escolhido
3. Executa as migrations em produção
4. Segue o checklist pré-deploy

### Para Debugging

1. Verifica os logs do Prisma (habilitado em desenvolvimento)
2. Usa o [**Database Guide**](./DATABASE.md) para entender queries complexas
3. Consulta a secção de Troubleshooting no [**Getting Started**](./GETTING_STARTED.md)

---

## 🔗 Links Úteis

- [README Principal](../README.md) — Overview do projeto
- [Prisma Schema](../prisma/schema.prisma) — Schema da base de dados
- [.env.example](../.env.example) — Template de variáveis de ambiente
- [Copilot Instructions](../.github/copilot-instructions.md) — Contexto para desenvolvimento com AI

---

## 💡 Convenções da Documentação

- **Código inline:** Usa \`backticks\` para variáveis, comandos e nomes de ficheiros
- **Blocos de código:** Sempre com syntax highlighting apropriado (```typescript, ```bash)
- **Emojis:** Usados estrategicamente para facilitar scanning visual
- **Links:** Sempre relativos à raiz do projeto
- **Idioma:** Português (PT-PT) para consistência com o contexto do projeto

---

## 📝 Como Atualizar Esta Documentação

Ao adicionar novas funcionalidades ou fazer alterações significativas:

1. Atualiza o ficheiro relevante em `/docs`
2. Se necessário, adiciona entrada no [CHANGELOG.md](./CHANGELOG.md)
3. Atualiza este índice se criares novos documentos
4. Mantém os exemplos de código sincronizados com a implementação atual

---

<div align="center">

**Dúvidas?** Abre uma [issue](https://github.com/your-username/aparus/issues) no GitHub.

[⬆ Voltar ao README principal](../README.md)

</div>
