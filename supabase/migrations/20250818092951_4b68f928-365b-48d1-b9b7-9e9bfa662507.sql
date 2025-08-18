-- Add reagendamento column to chats table
ALTER TABLE public.chats 
ADD COLUMN reagendamento boolean NOT NULL DEFAULT false;