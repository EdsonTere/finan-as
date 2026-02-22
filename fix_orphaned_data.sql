-- SCRIPT DE RECUPERAÇÃO DE DADOS (SIMPLIFICADO) --
-- Execute este script no SQL Editor do Supabase para vincular dados existentes à sua conta.

DO $$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    -- Se não houver usuário logado, tenta pegar pelo perfil
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'ERRO: Nenhum usuário encontrado. Crie uma conta primeiro.';
    ELSE
        RAISE NOTICE 'Vinculando dados ao usuário: %', v_user_id;

        -- Vincula tudo o que não tem dono
        UPDATE public.accounts SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE public.categories SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE public.transactions SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE public.budgets SET user_id = v_user_id WHERE user_id IS NULL;

        RAISE NOTICE 'Recuperação concluída!';
    END IF;
END $$;
