-- Habilitar RLS na tabela chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura de todos os chats (dados públicos do pipeline)
CREATE POLICY "Permitir leitura de todos os chats" 
ON public.chats 
FOR SELECT 
USING (true);

-- Habilitar realtime para a tabela chats
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;