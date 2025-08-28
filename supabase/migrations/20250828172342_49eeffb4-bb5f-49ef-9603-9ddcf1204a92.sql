-- Adicionar políticas RLS para permitir updates na tabela chats
CREATE POLICY "Permitir atualização de todos os chats" 
ON public.chats 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir inserção de todos os chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir exclusão de todos os chats" 
ON public.chats 
FOR DELETE 
USING (true);