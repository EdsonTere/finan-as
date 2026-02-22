-- ==========================================
-- SCRIPT DE CORREÇÃO COMPLETA (RLS + DADOS)
-- ==========================================
-- Este script faz 3 coisas:
-- 1. Garante que as colunas de user_id existem e o RLS está ativo.
-- 2. Vincula qualquer dado "sem dono" ao seu usuário atual.
-- 3. Garante que seu perfil de usuário existe na tabela 'profiles'.

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- 1. Identifica o usuário (ID do Supabase Auth)
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        -- Se rodar fora de um contexto de sessão (ex: editor SQL sem estar logado), 
        -- tenta pegar o primeiro perfil existente ou avisa.
        SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Atenção: Não foi possível identificar seu ID de usuário. Certifique-se de estar logado no Supabase para aplicar a posse dos dados.';
    ELSE
        RAISE NOTICE 'Aplicando correções para o usuário: %', v_user_id;

        -- 2. Garante Colunas e Ativa RLS
        ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users DEFAULT auth.uid();
        ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users DEFAULT auth.uid();
        ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users DEFAULT auth.uid();
        ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users DEFAULT auth.uid();

        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

        -- 3. Recria Políticas (Idempotente)
        DROP POLICY IF EXISTS "Users can manage their own accounts" ON public.accounts;
        CREATE POLICY "Users can manage their own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categories;
        CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
        CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own budgets" ON public.budgets;
        CREATE POLICY "Users can manage their own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
        CREATE POLICY "Users can view their own profiles" ON public.profiles FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
        CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

        -- 4. Vincula dados órfãos
        UPDATE public.accounts SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE public.categories SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE public.transactions SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE public.budgets SET user_id = v_user_id WHERE user_id IS NULL;

        -- 5. Garante Perfil
        INSERT INTO public.profiles (id, name, updated_at)
        VALUES (v_user_id, 'Usuário', now())
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'Correção concluída com sucesso!';
    END IF;
END $$;
