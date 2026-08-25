-- 1. Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Contas Financeiras
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    initial_balance NUMERIC DEFAULT 0,
    type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    color TEXT DEFAULT '#0284c7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    icon TEXT,
    color TEXT DEFAULT '#0284c7',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    target_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    description TEXT,
    is_fixed BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    installments JSONB,
    attachments TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela de Orçamentos (Budgets)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    period TEXT DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- HABILITAR RLS (Segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (RLS - IDEMPOTENTES)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own accounts" ON public.accounts;
CREATE POLICY "Users can manage their own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categories;
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own budgets" ON public.budgets;
CREATE POLICY "Users can manage their own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);

-- 6. Tabela de Backups Mensais
CREATE TABLE IF NOT EXISTS public.monthly_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    month_name TEXT NOT NULL,
    month_key TEXT NOT NULL,
    total_income NUMERIC DEFAULT 0,
    total_expense NUMERIC DEFAULT 0,
    net_balance NUMERIC DEFAULT 0,
    transactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.monthly_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own backups" ON public.monthly_backups;
CREATE POLICY "Users can manage their own backups" ON public.monthly_backups FOR ALL USING (auth.uid() = user_id);

