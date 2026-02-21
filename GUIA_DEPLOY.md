# Guia Passo a Passo: Correção e Deploy

Siga estas etapas exatamente nesta ordem para resolver o problema de salvamento:

---

## Passo 1: Corrigir as Permissões no Supabase (Obrigatório)

Este passo resolve o erro de permissão que impede o salvamento dos dados.

1.  Abra o seu **Painel do Supabase** no navegador.
2.  No menu lateral esquerdo, clique no ícone **"SQL Editor"** (ícone com o símbolo `>_`).
3.  Clique em **"+ New query"** (ou use um editor de SQL vazio que já exista).
4.  Abra o arquivo [fix_rls_policies.sql](file:///c:/Users/EDSON PC/Desktop/Finanças/fix_rls_policies.sql) aqui no editor de código e **copie todo o conteúdo**.
5.  Cole o conteúdo no editor do Supabase.
6.  Clique no botão **"Run"** (no canto inferior direito do editor do Supabase).
7.  Verifique se aparece a mensagem "Success" no log.

---

## Passo 2: Enviar as Atualizações de Código (Deploy)

Isso enviará as melhorias de tratamento de erro que fizemos para que possamos ver o erro real caso o Passo 1 não resolva tudo.

1.  Aqui no chat comigo, me responda com **"Pode enviar o código"**.
2.  Eu executarei automaticamente os comandos de `git commit` e `git push`.
3.  A **Vercel** detectará o envio no GitHub e fará o deploy (atualização do site) automaticamente em alguns segundos.

---

## Passo 3: Testar a Aplicação

1.  Aguarde cerca de 1 minuto após eu confirmar o envio do código.
2.  Acesse o seu link da Vercel (ex: `finan-as-liart.vercel.app`).
3.  Tente adicionar uma categoria novamente.
    - **Se funcionar**: Problema resolvido! 🎉
    - **Se aparecer um erro**: Me diga qual é a mensagem técnica que aparece no alerta (agora ela virá com detalhes como "Erro:", "Dica:", etc).
