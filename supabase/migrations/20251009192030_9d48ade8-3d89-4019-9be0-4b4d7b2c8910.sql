-- Add remarketing_pedro and remarketing_julianny columns to chats table
ALTER TABLE public.chats 
ADD COLUMN remarketing_pedro boolean DEFAULT false,
ADD COLUMN remarketing_julianny boolean DEFAULT false;