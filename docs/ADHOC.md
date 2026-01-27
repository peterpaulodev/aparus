# Decisões Técnicas Ad-Hoc

## Redirecionamento Pós-Login para Dashboard Admin

**Data:** 24 de Janeiro de 2026

**Contexto:**
Após o login com Google OAuth, os utilizadores não estavam a ser redirecionados automaticamente para a dashboard da barbearia que administram (`/admin`). Em vez disso, permaneciam na página onde estavam antes do login (`/`).

**Decisão Técnica:**
Implementado callback `redirect` no NextAuth para forçar redirecionamento para `/admin` após autenticação bem-sucedida.

**Alterações:**
- `src/app/api/auth/[...nextauth]/route.ts`: Adicionado callback `redirect` que retorna sempre `/admin`
- `src/app/login/page.tsx`: Mantido `callbackUrl: '/admin'` como fallback

**Fluxo:**
1. Utilizador faz login → NextAuth callback `redirect` → `/admin`
2. Se tem barbearia → vê dashboard
3. Se não tem → vê formulário de criação (lógica existente em `src/app/admin/page.tsx`)

**Considerações Futuras:**
- Se um utilizador administrar múltiplas barbearias, será necessário criar uma página de seleção
- Considerar adicionar middleware em `middleware.ts` para proteger todas as rotas `/admin/*`

**Relacionado:**
- Schema Prisma: `Barbershop.ownerId` relaciona com `User.id`
- NextAuth Session: Contém `user.id` necessário para query da barbearia