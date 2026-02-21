-- RODE ESTE SCRIPT SOMENTE SE SEUS DADOS ANTIGOS SUMIREM --
-- Este script vincula todos os dados que não têm "dono" ao seu usuário atual.

DO $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Busca o seu ID de usuário
    -- Se você estiver rodando no Editor SQL do Supabase, você pode precisar 
    -- substituir 'auth.uid()' pelo seu ID real entre aspas, caso o notice abaixo apareça.
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        -- Tenta pegar o primeiro usuário criado se auth.uid() for nulo no contexto do editor
        SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    END IF;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum usuário encontrado no sistema para vincular os dados.';
    ELSE
        -- Vincula contas sem dono
        UPDATE public.accounts SET user_id = current_user_id WHERE user_id IS NULL;
        
        -- Vincula categorias sem dono
        UPDATE public.categories SET user_id = current_user_id WHERE user_id IS NULL;
        
        -- Vincula transações sem dono
        UPDATE public.transactions SET user_id = current_user_id WHERE user_id IS NULL;
        
        -- Vincula orçamentos sem dono
        UPDATE public.budgets SET user_id = current_user_id WHERE user_id IS NULL;
        
        RAISE NOTICE 'Dados vinculados com sucesso ao usuário: %', current_user_id;
    END IF;
END $$;
