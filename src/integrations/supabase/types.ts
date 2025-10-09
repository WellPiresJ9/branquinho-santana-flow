export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bransantana_blocked_leads: {
        Row: {
          created_at: string
          id: number
          whatsapp: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          whatsapp?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          whatsapp?: number | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          agendados: boolean | null
          created_at: string
          em_atendimento: boolean | null
          hora_criacao_reuniao: string | null
          hora_reuniao: string | null
          id: number
          "mensagem-confirmacao-enviada": boolean | null
          "mensagem-reagendamento-enviada": boolean | null
          "mensagem-remarketing-enviada": boolean | null
          nome: string | null
          perdidos: boolean | null
          produto_juridico: string | null
          reagendamento: boolean | null
          remarketing: boolean | null
          remarketing_julianny: boolean | null
          remarketing_pedro: boolean | null
          responsavel: string | null
          "reuniao-confirmada": boolean | null
          status: string | null
          telefone: string | null
          vencemos: boolean | null
        }
        Insert: {
          agendados?: boolean | null
          created_at?: string
          em_atendimento?: boolean | null
          hora_criacao_reuniao?: string | null
          hora_reuniao?: string | null
          id?: number
          "mensagem-confirmacao-enviada"?: boolean | null
          "mensagem-reagendamento-enviada"?: boolean | null
          "mensagem-remarketing-enviada"?: boolean | null
          nome?: string | null
          perdidos?: boolean | null
          produto_juridico?: string | null
          reagendamento?: boolean | null
          remarketing?: boolean | null
          remarketing_julianny?: boolean | null
          remarketing_pedro?: boolean | null
          responsavel?: string | null
          "reuniao-confirmada"?: boolean | null
          status?: string | null
          telefone?: string | null
          vencemos?: boolean | null
        }
        Update: {
          agendados?: boolean | null
          created_at?: string
          em_atendimento?: boolean | null
          hora_criacao_reuniao?: string | null
          hora_reuniao?: string | null
          id?: number
          "mensagem-confirmacao-enviada"?: boolean | null
          "mensagem-reagendamento-enviada"?: boolean | null
          "mensagem-remarketing-enviada"?: boolean | null
          nome?: string | null
          perdidos?: boolean | null
          produto_juridico?: string | null
          reagendamento?: boolean | null
          remarketing?: boolean | null
          remarketing_julianny?: boolean | null
          remarketing_pedro?: boolean | null
          responsavel?: string | null
          "reuniao-confirmada"?: boolean | null
          status?: string | null
          telefone?: string | null
          vencemos?: boolean | null
        }
        Relationships: []
      }
      Cliente_Agendado: {
        Row: {
          Confirmado: boolean | null
          id: number
          whatsapp: string
        }
        Insert: {
          Confirmado?: boolean | null
          id?: number
          whatsapp: string
        }
        Update: {
          Confirmado?: boolean | null
          id?: number
          whatsapp?: string
        }
        Relationships: []
      }
      followup: {
        Row: {
          encerrado: boolean
          fup1: boolean | null
          fup2: boolean | null
          fup3: boolean | null
          fup4: boolean | null
          id: number
          telefone: string | null
          ultimaAtividade: string | null
          ultimaMensagem: string | null
        }
        Insert: {
          encerrado?: boolean
          fup1?: boolean | null
          fup2?: boolean | null
          fup3?: boolean | null
          fup4?: boolean | null
          id?: number
          telefone?: string | null
          ultimaAtividade?: string | null
          ultimaMensagem?: string | null
        }
        Update: {
          encerrado?: boolean
          fup1?: boolean | null
          fup2?: boolean | null
          fup3?: boolean | null
          fup4?: boolean | null
          id?: number
          telefone?: string | null
          ultimaAtividade?: string | null
          ultimaMensagem?: string | null
        }
        Relationships: []
      }
      Leads: {
        Row: {
          chatId: string | null
          "conversation-id": string | null
          created_at: string
          encerrado: boolean | null
          fup1: boolean | null
          fup2: boolean | null
          fup3: boolean | null
          fup4: boolean | null
          fup5: boolean | null
          "hora-remarketing": string | null
          id: number
          nome: string | null
          remarketing: string | null
          responsavel: string | null
          status: string | null
          telefone: string | null
          ultimaAtividade: string | null
          ultimaMensagem: string | null
        }
        Insert: {
          chatId?: string | null
          "conversation-id"?: string | null
          created_at?: string
          encerrado?: boolean | null
          fup1?: boolean | null
          fup2?: boolean | null
          fup3?: boolean | null
          fup4?: boolean | null
          fup5?: boolean | null
          "hora-remarketing"?: string | null
          id?: number
          nome?: string | null
          remarketing?: string | null
          responsavel?: string | null
          status?: string | null
          telefone?: string | null
          ultimaAtividade?: string | null
          ultimaMensagem?: string | null
        }
        Update: {
          chatId?: string | null
          "conversation-id"?: string | null
          created_at?: string
          encerrado?: boolean | null
          fup1?: boolean | null
          fup2?: boolean | null
          fup3?: boolean | null
          fup4?: boolean | null
          fup5?: boolean | null
          "hora-remarketing"?: string | null
          id?: number
          nome?: string | null
          remarketing?: string | null
          responsavel?: string | null
          status?: string | null
          telefone?: string | null
          ultimaAtividade?: string | null
          ultimaMensagem?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_historico_mensagens: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
