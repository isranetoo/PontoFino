# Rebalanceador — Plataforma de Consultoria de Investimentos

Plataforma completa para consultores de investimentos com rebalanceamento de carteiras, gestão de clientes, simulador de cenários, relatórios e controle de comissões.

## Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Recharts, SheetJS, Zustand
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions, Storage)
- **E-mail:** Resend (React Email)
- **Deploy:** Vercel
- **Monitoramento:** Sentry (opcional)

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.js              # Root layout
│   ├── page.js                # Redirect → /dashboard
│   ├── globals.css            # Estilos globais
│   ├── login/page.js          # Tela de login
│   ├── change-password/page.js # Troca de senha (primeiro acesso)
│   ├── api/invite/route.js    # API: criar convite de usuário
│   └── (platform)/            # Route group com sidebar
│       ├── layout.js          # Layout com sidebar
│       ├── dashboard/page.js
│       ├── clients/page.js
│       ├── agenda/page.js
│       ├── rebalance/page.js
│       ├── simulator/page.js
│       ├── reports/page.js
│       ├── commissions/page.js
│       └── admin/page.js
├── components/
│   ├── sidebar.js             # Navegação lateral
│   └── ui/index.js            # Componentes compartilhados
├── lib/
│   ├── utils.js               # Helpers (formatters, cn, etc.)
│   ├── constants.js           # Constantes (roles, classes, etc.)
│   └── supabase/
│       ├── client.js          # Client-side Supabase
│       ├── server.js          # Server-side Supabase
│       └── middleware.js      # Auth middleware helper
├── stores/
│   └── auth-store.js          # Zustand store (auth)
└── middleware.js               # Next.js middleware (proteção de rotas)
```

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

- **NEXT_PUBLIC_SUPABASE_URL** — URL do seu projeto Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** — Chave anon do Supabase
- **SUPABASE_SERVICE_ROLE_KEY** — Chave service role (NUNCA expor no client)
- **RESEND_API_KEY** — Chave da API do Resend
- **RESEND_FROM_EMAIL** — E-mail de envio (precisa de domínio verificado)

### 3. Rodar as migrations no Supabase

No painel do Supabase → SQL Editor, cole e execute, em ordem:

1. `src/stores/migrations/001_initial_schema.sql` — tabelas, enums, RLS, triggers e bucket de storage
2. `src/stores/migrations/002_dashboard_functions.sql` — funções auxiliares do dashboard
3. `src/stores/migrations/003_events_schema.sql` — agenda (reuniões, follow-ups, revisões)

### 4. Criar o primeiro usuário admin

No Supabase → Authentication → Users → "Add User":

- Email: `admin@suaconsultoria.com`
- Password: qualquer senha
- User Metadata (JSON):
  ```json
  {
    "full_name": "Seu Nome",
    "role": "admin",
    "must_change_password": false
  }
  ```

### 5. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`

### 6. Deploy na Vercel

```bash
# Conecte o repo no GitHub e faça deploy pelo Vercel Dashboard
# Ou via CLI:
npx vercel
```

Adicione as variáveis de ambiente no painel da Vercel.

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Dashboard** | KPIs (AUM, clientes, receita), gráfico de performance vs CDI/IBOV |
| **Clientes** | CRUD completo, perfil de risco, busca |
| **Agenda** | Reuniões, follow-ups e revisões de carteira com calendário mensal |
| **Rebalanceamento** | Import Excel, cálculo de alocação, export Excel |
| **Simulador** | Projeções com parâmetros de mercado (Selic, IBOV, etc.) |
| **Relatórios** | Rentabilidade acumulada, retorno mensal, Sharpe ratio |
| **Comissões** | Receita por cliente e tipo, breakdown visual |
| **Admin** | Convite de usuários, gestão de roles, senha temporária |

## Segurança

- **RLS por consultor** — cada consultor só acessa seus dados
- **Sem tela de registro** — acesso apenas por convite do admin
- **Troca obrigatória de senha** no primeiro login
- **Audit log** automático em todas as tabelas sensíveis
- **Middleware** protege todas as rotas autenticadas
