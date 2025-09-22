-- Habilitar Row Level Security na tabela chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso completo à tabela chats
-- Como esta é uma aplicação de gerenciamento de leads sem autenticação específica,
-- vamos permitir acesso público aos dados
CREATE POLICY "Allow full access to chats" 
ON public.chats 
FOR ALL 
USING (true) 
WITH CHECK (true);