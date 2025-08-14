import { useState, useEffect } from 'react';
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LeadChart } from "@/components/dashboard/LeadChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatData {
  id: number;
  nome: string | null;
  telefone: string | null;
  produto_juridico: string | null;
  created_at: string;
  em_atendimento: boolean;
  agendados: boolean;
  remarketing: boolean;
  vencemos: boolean;
  perdidos: boolean;
  responsavel: string | null;
  status: string | null;
}

export default function Dashboard() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar chats:', error);
        setLoading(false);
        return;
      }

      setChats(data || []);
      setLoading(false);
    };

    fetchChats();

    // Real-time updates
    const channel = supabase
      .channel('dashboard-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChats(prev => [payload.new as ChatData, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setChats(prev => prev.map(chat => 
              chat.id === payload.new.id ? payload.new as ChatData : chat
            ));
          } else if (payload.eventType === 'DELETE') {
            setChats(prev => prev.filter(chat => chat.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calcular métricas dos dados reais
  const emAtendimento = chats.filter(chat => 
    !chat.agendados && !chat.remarketing && !chat.vencemos && !chat.perdidos
  ).length;
  const agendados = chats.filter(chat => chat.agendados).length;
  const remarketingCount = chats.filter(chat => chat.remarketing).length;
  const vencemos = chats.filter(chat => chat.vencemos).length;
  const perdidos = chats.filter(chat => chat.perdidos).length;

  const metrics = [
    {
      title: "Em Atendimento",
      value: emAtendimento,
      icon: Users,
      description: "Leads ativos no processo",
      trend: { value: 12, isPositive: true },
      variant: 'default' as const
    },
    {
      title: "Agendados",
      value: agendados,
      icon: Calendar,
      description: "Consultas marcadas",
      trend: { value: 8, isPositive: true },
      variant: 'success' as const
    },
    {
      title: "Remarketing",
      value: remarketingCount,
      icon: TrendingUp,
      description: "Reativação de contatos",
      trend: { value: 5, isPositive: false },
      variant: 'warning' as const
    },
    {
      title: "VENCEMOS! 🏆",
      value: vencemos,
      icon: CheckCircle,
      description: "Casos finalizados com sucesso",
      trend: { value: 15, isPositive: true },
      variant: 'success' as const
    },
    {
      title: "Perdidos",
      value: perdidos,
      icon: XCircle,
      description: "Oportunidades não convertidas",
      trend: { value: 3, isPositive: false },
      variant: 'destructive' as const
    }
  ];

  const totalLeads = chats.length;
  const conversionRate = totalLeads > 0 ? ((vencemos / totalLeads) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da jornada dos leads - {totalLeads} leads ativos
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as oportunidades ativas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads convertidos em casos
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximas Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-xs text-muted-foreground mt-1">
              Follow-ups agendados hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de distribuição */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Distribuição dos Leads por Status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualização da jornada atual dos clientes
          </p>
        </CardHeader>
        <CardContent>
          <LeadChart />
        </CardContent>
      </Card>
    </div>
  );
}