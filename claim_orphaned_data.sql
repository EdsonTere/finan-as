-- SCRIPT DE RECUPERAÇÃO DEFINITIVA DE DADOS --
-- Use este script se você entrar no sistema e não vir NADA (0 contas, 0 categorias).

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- 1. Pega o ID do usuário que deve ser o dono dos dados
    -- Tenta primeiro o usuário logado
    v_user_id := auth.uid();
    
    -- Se não encontrar logado (contexto SQL), pega o primeiro usuário da tabela de profiles
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Não foi possível encontrar nenhum usuário no sistema. Você já criou uma conta?';
    END IF;

    -- 2. Vincula tudo o que estiver "órfão" (sem user_id) ao usuário encontrado
    UPDATE public.accounts SET user_id = v_user_id WHERE user_id IS NULL;
    UPDATE public.categories SET user_id = v_user_id WHERE user_id IS NULL;
    UPDATE public.transactions SET user_id = v_user_id WHERE user_id IS NULL;
    UPDATE public.budgets SET user_id = v_user_id WHERE user_id IS NULL;
    
    -- 3. GARANTE que o perfil também está correto
    INSERT INTO public.profiles (id, name, updated_at)
    VALUES (v_user_id, 'Usuário', now())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Dados recuperados para o usuário: %', v_user_id;
END $$;
