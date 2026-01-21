# 🚀 Getting Started — Aparatus

Guia completo para configurar o ambiente de desenvolvimento do **Aparatus** do zero.

---

## 📋 Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Instalação](#-instalação)
3. [Configuração da Base de Dados](#-configuração-da-base-de-dados)
4. [Variáveis de Ambiente](#-variáveis-de-ambiente)
5. [Migrations e Seed](#-migrations-e-seed)
6. [Primeiro Run](#-primeiro-run)
7. [Troubleshooting](#-troubleshooting)

---

## 📦 Pré-requisitos

Antes de começar, certifica-te que tens instalado:

### Obrigatórios

- **Node.js** 20.x ou superior ([Download](https://nodejs.org))
- **pnpm** 9.x ou superior ([Instalação](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL** 16+ ([Download](https://postgresql.org/download)) **OU** [Docker Desktop](https://docker.com/products/docker-desktop)
- **Git** ([Download](https://git-scm.com))

### Opcional (mas recomendado)

- **VS Code** com extensões:
  - Prisma (Prisma.prisma)
  - ESLint (dbaeumer.vscode-eslint)
  - Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
  - TypeScript Error Translator (mattpocock.ts-error-translator)

### Contas Necessárias

- **Google Cloud Console** — Para configurar OAuth ([console.cloud.google.com](https://console.cloud.google.com))

---

## 🔧 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/your-username/aparus.git
cd aparus
```

### 2. Instalar Dependências

```bash
pnpm install
```

Este comando instala todas as dependências e executa automaticamente `prisma generate` (via postinstall hook).

**Esperado:** ~2-3 minutos dependendo da tua conexão.

---

## 💾 Configuração da Base de Dados

Tens duas opções: **Docker** (recomendado para desenvolvimento) ou **PostgreSQL local**.

### Opção A: Docker (Recomendado)

#### 1. Iniciar PostgreSQL Container

```bash
docker-compose up -d
```

Este comando:
- Cria um container `aparus_postgres` com PostgreSQL 16
- Mapeia a porta `5432` para o host
- Cria um volume persistente `postgres_data`
- Configura healthcheck automático

#### 2. Verificar se está a correr

```bash
docker ps
```

Deves ver:
```
CONTAINER ID   IMAGE            STATUS          PORTS                    NAMES
abc123def456   postgres:16-alpine   Up 10 seconds   0.0.0.0:5432->5432/tcp   aparus_postgres
```

#### 3. Aceder à base de dados (opcional)

```bash
docker exec -it aparus_postgres psql -U postgres -d aparus
```

Comandos úteis no psql:
- `\l` — Listar bases de dados
- `\dt` — Listar tabelas
- `\q` — Sair

---

### Opção B: PostgreSQL Local

#### 1. Instalar PostgreSQL

- **Windows:** [Download Installer](https://postgresql.org/download/windows)
- **macOS:** `brew install postgresql@16`
- **Linux:** `sudo apt install postgresql-16` (Ubuntu/Debian)

#### 2. Criar Base de Dados

```bash
# Aceder ao PostgreSQL
psql -U postgres

# Criar base de dados
CREATE DATABASE aparus;

# Criar utilizador (opcional)
CREATE USER aparus_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE aparus TO aparus_user;

# Sair
\q
```

---

## 🔐 Variáveis de Ambiente

### 1. Criar ficheiro .env

```bash
cp .env.example .env
```

### 2. Configurar DATABASE_URL

Edita o ficheiro `.env` criado:

#### Se usaste Docker (Opção A):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aparus"
```

#### Se usaste PostgreSQL local (Opção B):

```env
DATABASE_URL="postgresql://seu_user:sua_password@localhost:5432/aparus"
```

**Formato completo:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

---

### 3. Configurar NextAuth

#### 3.1 Gerar NEXTAUTH_SECRET

Usa um dos métodos:

**Método 1 (OpenSSL):**
```bash
openssl rand -base64 32
```

**Método 2 (Online):**
Visita [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

**Adiciona ao .env:**
```env
NEXTAUTH_SECRET="o_secret_gerado_aqui"
NEXTAUTH_URL="http://localhost:3000"
```

---

#### 3.2 Configurar Google OAuth

1. **Acede ao Google Cloud Console:**
   - [console.cloud.google.com](https://console.cloud.google.com)

2. **Cria ou seleciona um projeto:**
   - Clica em "Select a project" no topo
   - "New Project" → Nome: "Aparatus Dev"

3. **Ativa a API do Google+:**
   - Menu lateral → "APIs & Services" → "Library"
   - Pesquisa "Google+ API"
   - Clica em "Enable"

4. **Cria credenciais OAuth:**
   - "APIs & Services" → "Credentials"
   - "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: "Aparatus Local Dev"
   
5. **Configura Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

6. **Copia as credenciais:**
   - Copia o **Client ID** e **Client Secret**

7. **Adiciona ao .env:**
   ```env
   GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"
   ```

---

### Ficheiro .env Completo (Exemplo)

```env
# Base de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aparus"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="kJ8sK2jD9fL3mN4pQ5rT6uV7wX8yZ9aB0cD1eF2gH3iJ4"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc123def456.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"
```

---

## 🗃️ Migrations e Seed

### 1. Executar Migrations

```bash
pnpm run db:migrate
```

Este comando:
- Aplica todas as migrations em `prisma/migrations/`
- Cria as tabelas na base de dados
- Gera o Prisma Client atualizado

**Esperado:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "aparus"

20260116223031_fix_user_barber_relation ... applied (125ms)

✔ Generated Prisma Client
```

---

### 2. Executar Seed

```bash
pnpm run db:seed
```

Este comando popula a base de dados com:

- **1 Utilizador Admin:**
  - Email: `admin@aparatus.com`
  - (Login via Google OAuth, certifica-te que usas este email)

- **1 Barbearia:**
  - Nome: "Barbearia Aparatus"
  - Slug: `barbearia-aparatus`
  - URL pública: `http://localhost:3000/barbearia-aparatus`

- **4 Serviços:**
  - Corte Clássico — €45 (45 min)
  - Barba Completa — €35 (30 min)
  - Pézinho — €15 (15 min)
  - Combo Completo — €70 (60 min)

- **2 Barbeiros:**
  - João Navalha
  - Carlos Tesoura
  - (Ambos com disponibilidade Seg-Sex 09:00-18:00)

**Esperado:**
```
🌱 Starting seed...
✅ Admin user created
✅ Barbershop created with slug: barbearia-aparatus
✅ Services created
✅ Barbers created
🎉 Seed completed successfully!
```

---

## 🎬 Primeiro Run

### 1. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

**Esperado:**
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Environments: .env

✓ Starting...
✓ Ready in 2.3s
```

---

### 2. Acessar a Aplicação

Abre o browser em: [http://localhost:3000](http://localhost:3000)

---

### 3. Fazer Login

1. Clica em "Login" (ou acede diretamente a `/login`)
2. Clica no botão **"Sign in with Google"**
3. Usa a conta Google com email **`admin@aparatus.com`** (configurado no seed)
4. Autoriza a aplicação

**Nota:** Se usares um email diferente, precisas de:
- Atualizar o seed script com o teu email, OU
- Criar manualmente uma barbearia via `createBarbershop` Server Action

---

### 4. Aceder ao Dashboard Admin

Após login, serás redirecionado para: `/admin`

Deves ver:
- 📊 Cards de métricas (Hoje, Mês, Total Agendamentos)
- 📈 Gráfico de receita dos últimos 7 dias
- 📅 Lista de próximos agendamentos

---

### 5. Testar a Página Pública de Agendamento

Acede a: [http://localhost:3000/barbearia-aparatus](http://localhost:3000/barbearia-aparatus)

Experimenta criar um agendamento:
1. Clica num serviço (ex: "Corte Clássico")
2. Seleciona um barbeiro
3. Escolhe uma data futura
4. Escolhe um horário disponível
5. Preenche nome e telefone
6. Confirma

Deves ver uma toast notification de sucesso! ✅

---

## 🔍 Troubleshooting

### ❌ Erro: "Can't reach database server at localhost:5432"

**Causa:** PostgreSQL não está a correr.

**Solução:**

#### Se usas Docker:
```bash
# Verificar se o container está a correr
docker ps -a

# Se está stopped, inicia
docker-compose up -d

# Ver logs se houver erro
docker-compose logs postgres
```

#### Se usas PostgreSQL local:
```bash
# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql

# Windows
# Inicia o serviço "PostgreSQL" no Services.msc
```

---

### ❌ Erro: "Environment variable not found: DATABASE_URL"

**Causa:** Ficheiro `.env` não existe ou não está na raiz do projeto.

**Solução:**
```bash
# Verificar se existe
ls -la .env

# Se não existir, criar
cp .env.example .env

# Editar com as tuas credenciais
code .env  # ou vim .env
```

---

### ❌ Erro: "Invalid `prisma.user.findUnique()` invocation"

**Causa:** As migrations não foram aplicadas.

**Solução:**
```bash
# Aplica migrations
pnpm run db:migrate

# Se falhar, reset completo (⚠️ apaga dados)
npx prisma migrate reset --force
pnpm run db:seed
```

---

### ❌ Erro: "OAuthCallback Error: access_denied"

**Causa:** Google OAuth não está configurado corretamente.

**Solução:**

1. **Verifica o Authorized Redirect URI no Google Console:**
   - Deve ser exatamente: `http://localhost:3000/api/auth/callback/google`
   - **SEM** trailing slash

2. **Verifica NEXTAUTH_URL no .env:**
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   ```
   - **SEM** trailing slash

3. **Verifica se usaste o email do seed:**
   - Ou usa `admin@aparatus.com`
   - Ou atualiza `prisma/seed.ts` com o teu email e re-seed

---

### ❌ Erro: "Port 3000 is already in use"

**Causa:** Outro processo está a usar a porta 3000.

**Solução:**

#### Opção 1: Matar o processo
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### Opção 2: Usar porta diferente
```bash
PORT=3001 pnpm dev
```

Não esqueças de atualizar:
- `.env` → `NEXTAUTH_URL="http://localhost:3001"`
- Google Console → Redirect URI com porta 3001

---

### ❌ Erro: "Prisma Client could not locate the Query Engine"

**Causa:** Prisma Client não foi gerado.

**Solução:**
```bash
npx prisma generate
```

---

### ❌ Erro: "Cannot find module '@/lib/prisma'"

**Causa:** TypeScript path mapping não está configurado.

**Solução:**

1. **Verifica `tsconfig.json`:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Restart do VS Code:**
   - Cmd/Ctrl + Shift + P → "Reload Window"

3. **Restart do TypeScript Server:**
   - Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

---

### 🧹 Reset Completo (Último Recurso)

Se nada funcionar, reset completo:

```bash
# 1. Para o servidor dev (Ctrl+C)

# 2. Para e remove o Docker container
docker-compose down -v

# 3. Remove node_modules e lock files
rm -rf node_modules pnpm-lock.yaml

# 4. Remove .next cache
rm -rf .next

# 5. Reinstala dependências
pnpm install

# 6. Inicia PostgreSQL
docker-compose up -d

# 7. Reset das migrations (⚠️ apaga tudo)
npx prisma migrate reset --force

# 8. Executa seed
pnpm run db:seed

# 9. Inicia dev server
pnpm dev
```

---

## ✅ Checklist Pós-Instalação

Confirma que tudo está a funcionar:

- [ ] PostgreSQL está a correr (Docker ou local)
- [ ] `.env` está configurado com todas as variáveis
- [ ] `pnpm install` executou sem erros
- [ ] `pnpm run db:migrate` aplicou as migrations
- [ ] `pnpm run db:seed` criou dados de exemplo
- [ ] `pnpm dev` inicia sem erros
- [ ] `/login` redireciona para Google OAuth
- [ ] Consigo fazer login com Google
- [ ] `/admin` mostra o dashboard
- [ ] `/barbearia-aparatus` mostra a página pública
- [ ] Consigo criar um agendamento na página pública

---

## 🎓 Próximos Passos

Agora que tens o ambiente a funcionar:

1. 📖 Lê a [**Arquitetura**](./ARCHITECTURE.md) para entender o design do sistema
2. 💾 Estuda o [**Database Schema**](./DATABASE.md) para perceber os modelos
3. 🔌 Consulta a [**API Reference**](./API.md) para ver as Server Actions disponíveis
4. 🤝 Revê o [**Contributing Guide**](./CONTRIBUTING.md) antes de fazer alterações

---

## 💬 Precisa de Ajuda?

- Abre uma [issue no GitHub](https://github.com/your-username/aparus/issues)
- Consulta a secção de Troubleshooting acima
- Verifica os logs do Prisma (estão habilitados em desenvolvimento)

---

<div align="center">

**Pronto para desenvolver! 🚀**

[⬆ Voltar ao índice](#-getting-started--aparatus) • [📚 Documentação](./README.md)

</div>
