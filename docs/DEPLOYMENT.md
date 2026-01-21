# 🚢 Deployment — Aparatus

Guia completo para deploy do **Aparatus** em produção, incluindo Vercel (recomendado), PostgreSQL em cloud, e alternativa Docker self-hosted.

---

## 📋 Índice

1. [Opções de Deploy](#-opções-de-deploy)
2. [Deploy em Vercel (Recomendado)](#-deploy-em-vercel-recomendado)
3. [PostgreSQL em Cloud](#-postgresql-em-cloud)
4. [Deploy Self-Hosted (Docker)](#-deploy-self-hosted-docker)
5. [Configuração de Domínio](#-configuração-de-domínio)
6. [Checklist Pré-Deploy](#-checklist-pré-deploy)
7. [Monitorização e Logs](#-monitorização-e-logs)
8. [Rollback e Troubleshooting](#-rollback-e-troubleshooting)

---

## 🎯 Opções de Deploy

### Comparação Rápida

| Opção | Complexidade | Custo | Performance | Recomendado para |
|-------|--------------|-------|-------------|------------------|
| **Vercel + Vercel Postgres** | ⭐ Muito Fácil | Grátis → €20/mês | Excelente (Edge) | MVP, produção |
| **Vercel + Supabase** | ⭐⭐ Fácil | Grátis → €25/mês | Excelente | Produção escalável |
| **Vercel + Neon** | ⭐⭐ Fácil | Grátis → €19/mês | Excelente (Serverless) | Produção moderna |
| **Docker Self-Hosted** | ⭐⭐⭐⭐ Complexo | Variável (VPS) | Depende do servidor | Controlo total |

---

## 🟢 Deploy em Vercel (Recomendado)

### Por que Vercel?

- ✅ **Zero-config** para Next.js
- ✅ **Edge Runtime** (latência ultra-baixa)
- ✅ **Preview Deployments** (cada PR = URL única)
- ✅ **Rollback** instantâneo
- ✅ **Analytics** integrado
- ✅ **Free tier** generoso (100GB bandwidth)

---

### Passo 1: Preparar o Repositório

#### 1.1 Push para GitHub/GitLab/Bitbucket

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

#### 1.2 Verificar .gitignore

Certifica-te que `.env` está ignorado:

```gitignore
# .gitignore
.env
.env.local
.env.production
node_modules/
.next/
```

---

### Passo 2: Criar Projeto na Vercel

#### 2.1 Acede a [vercel.com](https://vercel.com)

- Faz login com GitHub/GitLab/Bitbucket
- Clica em **"Add New Project"**
- Seleciona o repositório **aparus**

#### 2.2 Configuração do Projeto

**Framework Preset:** Next.js (detetado automaticamente)

**Root Directory:** `./` (raiz do projeto)

**Build Command:**
```bash
pnpm run build
```

**Output Directory:** `.next` (automático)

**Install Command:**
```bash
pnpm install
```

---

### Passo 3: Configurar Variáveis de Ambiente

Na dashboard da Vercel:

1. Vai a **Settings → Environment Variables**
2. Adiciona as seguintes variáveis:

#### 3.1 NextAuth

```env
NEXTAUTH_URL=https://aparus.vercel.app
NEXTAUTH_SECRET=<gera_novo_secret_para_producao>
```

**Gerar novo secret:**
```bash
openssl rand -base64 32
```

⚠️ **IMPORTANTE:** NÃO uses o mesmo secret de desenvolvimento!

#### 3.2 Google OAuth

```env
GOOGLE_CLIENT_ID=<teu_client_id>
GOOGLE_CLIENT_SECRET=<teu_client_secret>
```

**⚠️ Atualiza Authorized Redirect URIs no Google Console:**
- Adiciona: `https://aparus.vercel.app/api/auth/callback/google`
- Adiciona também o URL de preview: `https://*.vercel.app/api/auth/callback/google`

#### 3.3 Database (ver secção seguinte)

Escolhe uma das opções:
- Vercel Postgres
- Supabase
- Neon

---

## 💾 PostgreSQL em Cloud

### Opção A: Vercel Postgres (Mais Simples)

#### 1. Criar Database

Na dashboard da Vercel:
1. Vai ao teu projeto
2. Storage → Create Database → **Postgres**
3. Escolhe região (preferencialmente próxima dos utilizadores)
4. Clica **Create**

#### 2. Conectar ao Projeto

A Vercel adiciona automaticamente estas variáveis:

```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"
```

#### 3. Configurar Prisma

Atualiza `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

**Explicação:**
- `url` — Conexão pooled (para queries)
- `directUrl` — Conexão direta (para migrations)

#### 4. Executar Migrations

**Via Vercel CLI:**
```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Pull env vars
vercel env pull .env.production

# Executar migrations
DATABASE_URL=$POSTGRES_URL_NON_POOLING npx prisma migrate deploy
```

**Ou via comando direto:**
```bash
npx prisma migrate deploy
```

---

### Opção B: Supabase (Recomendado para Escalabilidade)

#### 1. Criar Projeto

1. Acede a [supabase.com](https://supabase.com)
2. **New Project**
3. Escolhe nome, password e região
4. Aguarda ~2 minutos (provisionamento)

#### 2. Obter Connection String

1. Vai a **Settings → Database**
2. Copia **Connection String** (modo: Pooling)
3. Substitui `[YOUR-PASSWORD]` pela password do projeto

**Exemplo:**
```
postgresql://postgres.xyz:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

#### 3. Adicionar à Vercel

```env
DATABASE_URL="postgresql://postgres.xyz:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

#### 4. Executar Migrations

No terminal local (com `.env.production` configurado):

```bash
npx prisma migrate deploy
```

**Vantagens do Supabase:**
- ✅ Backup automático
- ✅ Point-in-time recovery
- ✅ Dashboard SQL integrado
- ✅ Extensões PostgreSQL (pgvector, etc)
- ✅ Free tier: 500MB database, 2GB bandwidth

---

### Opção C: Neon (Serverless PostgreSQL)

#### 1. Criar Database

1. Acede a [neon.tech](https://neon.tech)
2. **Create Project**
3. Escolhe nome e região

#### 2. Obter Connection String

Copia o **Connection String** fornecido:

```
postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

#### 3. Configurar na Vercel

```env
DATABASE_URL="postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

**Vantagens do Neon:**
- ✅ **Serverless** (escala para zero quando não usado)
- ✅ **Branching** (cópia da DB por branch Git)
- ✅ Cold start rápido (~300ms)
- ✅ Free tier: 3GB storage

---

### Passo 4: Executar Seed (Opcional)

**⚠️ Apenas se quiseres dados de exemplo em produção!**

```bash
# Via Vercel CLI (após pull das env vars)
vercel env pull .env.production
pnpm run db:seed
```

---

### Passo 5: Deploy! 🚀

#### Automático (Recomendado)

Quando fazes push para `main`:

```bash
git push origin main
```

A Vercel:
1. Deteta o push
2. Executa `pnpm install`
3. Executa `pnpm run build` (que inclui `prisma generate`)
4. Cria deployment
5. Atribui URL de produção

**Preview Deployments:**
- Cada PR/branch cria um URL único
- Ex: `aparus-git-feature-xyz.vercel.app`

#### Manual (via CLI)

```bash
vercel --prod
```

---

### Passo 6: Verificar Deployment

#### 6.1 Acede ao URL

```
https://aparus.vercel.app
```

#### 6.2 Testa fluxos principais

- [ ] Login com Google OAuth funciona
- [ ] Dashboard `/admin` carrega
- [ ] Página pública `/barbearia-aparatus` (se seed foi executado)
- [ ] Criar serviço no admin
- [ ] Criar agendamento na página pública

---

## 🐳 Deploy Self-Hosted (Docker)

### Arquitetura

```
┌─────────────────┐
│  Reverse Proxy  │  (Nginx/Traefik)
│   (Port 80/443) │
└────────┬────────┘
         │
┌────────▼────────┐
│  Next.js App    │  (Container)
│   (Port 3000)   │
└────────┬────────┘
         │
┌────────▼────────┐
│  PostgreSQL     │  (Container)
│   (Port 5432)   │
└─────────────────┘
```

---

### Pré-requisitos

- VPS com Ubuntu 22.04+ (DigitalOcean, Hetzner, AWS EC2)
- Docker & Docker Compose instalados
- Domínio apontado para o IP do servidor

---

### Passo 1: Clonar Repositório no Servidor

```bash
ssh user@seu-servidor.com

git clone https://github.com/your-username/aparus.git
cd aparus
```

---

### Passo 2: Configurar .env

```bash
cp .env.example .env
nano .env
```

Preenche com valores de produção:

```env
DATABASE_URL="postgresql://postgres:seu_password_forte@postgres:5432/aparus"
NEXTAUTH_URL="https://aparus.seudominio.com"
NEXTAUTH_SECRET="<gera_novo>"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

### Passo 3: Atualizar docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: aparus_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-seu_password_forte}
      POSTGRES_DB: aparus
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - aparus_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: aparus_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-seu_password_forte}@postgres:5432/aparus
      NEXTAUTH_URL: https://aparus.seudominio.com
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - aparus_network

volumes:
  postgres_data:

networks:
  aparus_network:
```

---

### Passo 4: Build e Start

```bash
docker-compose up -d --build
```

**Verificar logs:**
```bash
docker-compose logs -f app
```

---

### Passo 5: Executar Migrations

```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app pnpm run db:seed
```

---

### Passo 6: Configurar Nginx (Reverse Proxy)

#### Instalar Nginx

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

#### Criar configuração

```bash
sudo nano /etc/nginx/sites-available/aparus
```

```nginx
server {
    listen 80;
    server_name aparus.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Ativar configuração

```bash
sudo ln -s /etc/nginx/sites-available/aparus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Configurar SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d aparus.seudominio.com
```

---

### Passo 7: Testar

Acede a: `https://aparus.seudominio.com`

---

## 🌐 Configuração de Domínio

### Opção 1: Domínio Personalizado na Vercel

1. Vai a **Settings → Domains**
2. Adiciona `aparus.com` (ou subdomínio)
3. Configura DNS records no teu provider:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21 (IP da Vercel)
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Aguarda propagação (~24h, geralmente <1h)

---

### Opção 2: DNS para Self-Hosted

**A Record:**
```
Type: A
Name: @
Value: <IP_DO_TEU_SERVIDOR>
```

**CNAME (opcional, para www):**
```
Type: CNAME
Name: www
Value: aparus.seudominio.com
```

---

## ✅ Checklist Pré-Deploy

### Segurança

- [ ] `.env` está no `.gitignore`
- [ ] `NEXTAUTH_SECRET` é diferente de desenvolvimento
- [ ] Passwords de PostgreSQL são fortes (>20 caracteres)
- [ ] Google OAuth redirect URIs incluem URL de produção

### Performance

- [ ] Prisma queries otimizadas (usa `select` ou `include` apropriado)
- [ ] Images otimizadas (Next.js Image component)
- [ ] Bundle analisado (`npx @next/bundle-analyzer`)

### Base de Dados

- [ ] Migrations aplicadas em produção
- [ ] Seed executado (se necessário)
- [ ] Backup automático configurado

### Monitorização

- [ ] Google Analytics ou similar configurado
- [ ] Error tracking (Sentry recomendado)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)

### SEO

- [ ] `metadata` configurado em todas as páginas
- [ ] `robots.txt` criado
- [ ] `sitemap.xml` gerado
- [ ] Open Graph tags adicionados

---

## 📊 Monitorização e Logs

### Vercel Analytics

Ativar na dashboard:
1. **Analytics** → Enable
2. **Speed Insights** → Enable

### Logs em Tempo Real

```bash
vercel logs <deployment-url> --follow
```

### Prisma Query Logs (Produção)

Em `lib/prisma.ts`:

```typescript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' 
    ? ['error'] 
    : ['query', 'info', 'warn', 'error'],
});
```

### Sentry (Error Tracking)

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🔄 Rollback e Troubleshooting

### Rollback Instantâneo (Vercel)

1. Vai a **Deployments**
2. Encontra o deployment anterior
3. Clica **"..."** → **Promote to Production**

### Troubleshooting Comum

#### ❌ "Cannot connect to database"

**Solução:**
- Verifica `DATABASE_URL` nas env vars
- Verifica firewall do PostgreSQL (permite IP da Vercel)
- Testa conexão: `psql $DATABASE_URL`

#### ❌ "OAuthCallback Error"

**Solução:**
- Verifica `NEXTAUTH_URL` (deve ser exatamente o domínio)
- Atualiza Authorized Redirect URIs no Google Console

#### ❌ "Prisma Client not found"

**Solução:**
- Build command deve incluir `prisma generate`
- Verifica `package.json`: `"build": "prisma generate && next build"`

---

<div align="center">

**Aplicação em produção com confiança** 🚢

[⬆ Voltar ao topo](#-deployment--aparatus) • [📚 Documentação](./README.md)

</div>
