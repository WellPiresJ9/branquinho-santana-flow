import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatMessage {
  autor: "lead" | "agente";
  texto: string;
}

function parseHistorico(raw: string | null): ChatMessage[] {
  if (!raw) return [];

  // 1. Remove all content between [[ and ]]
  let cleaned = raw.replace(/\[\[[\s\S]*?\]\]/g, "");

  // 2. Remove any remaining technical artifacts
  cleaned = cleaned
    .replace(/"documentId"[^,\n]*/g, "")
    .replace(/Used tools[\s\S]*?(?=(Lead:|Agente|$))/gi, "")
    .replace(/\{[\s\S]*?\}/g, "");

  // 3. Split into messages by prefixes
  const messageRegex = /(Lead:|Agente\s*(?:IA|A)?:)/gi;
  const parts: ChatMessage[] = [];
  let lastIndex = 0;
  let lastAutor: "lead" | "agente" | null = null;
  const matches = [...cleaned.matchAll(new RegExp(messageRegex.source, "gi"))];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const prefix = match[0].toLowerCase();
    const startOfText = match.index! + match[0].length;
    const endOfText = i + 1 < matches.length ? matches[i + 1].index! : cleaned.length;
    const texto = cleaned.slice(startOfText, endOfText).trim();

    // Normalize multiple newlines and clean whitespace
    const cleanedText = texto
      .replace(/\n{2,}/g, "\n")
      .replace(/^\s+|\s+$/g, "")
      .trim();

    if (!cleanedText) continue;

    const autor: "lead" | "agente" = prefix.startsWith("lead") ? "lead" : "agente";
    parts.push({ autor, texto: cleanedText });
  }

  return parts;
}

interface ChatHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string | null;
  historico: string | null;
}

export function ChatHistoryDialog({
  open,
  onOpenChange,
  leadName,
  historico,
}: ChatHistoryDialogProps) {
  const messages = useMemo(() => parseHistorico(historico), [historico]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Conversa — {leadName || "Lead"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              Nenhum histórico de conversa disponível.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-2 ${
                    msg.autor === "agente" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.autor === "lead" && (
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      msg.autor === "agente"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.texto}
                  </div>
                  {msg.autor === "agente" && (
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        <Bot className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
