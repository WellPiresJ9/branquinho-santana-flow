import { useState, useEffect } from 'react';
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LeadChart } from "@/components/dashboard/LeadChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Counts {
  total: number;
  emAtendimento: number;
  agendados: number;
  remarketing: number;
  vencemos: number;
  perdidos: number;
}

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts>({ total: 0, emAtendimento: 0, agendados: 0, remarketing: 0, vencemos: 0, perdidos: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    const [totalRes, agendadosRes, remarketingRes, vencemosRes, perdidosRes] = await Promise.all([
      supabase.from('chats').select('*', { count: 'exact', head: true }),
      supabase.from('chats').select('*', { count: 'exact', head: true }).eq('agendados', true),
      supabase.from('chats').select('*', { count: 'exact', head: true }).eq('remarketing', true),
      supabase.from('chats').select('*', { count: 'exact', head: true }).eq('vencemos', true),
      supabase.from('chats').select('*', { count: 'exact', head: true }).eq('perdidos', true),
    ]);

    const total = totalRes.count ?? 0;
    const agendados = agendadosRes.count ?? 0;
    const remarketing = remarketingRes.count ?? 0;
    const vencemos = vencemosRes.count ?? 0;
    const perdidos = perdidosRes.count ?? 0;
    const emAtendimento = total - agendados - remarketing - vencemos - perdidos;

    setCounts({ total, emAtendimento, agendados, remarketing, vencemos, perdidos });
    setLoading(false);
  };

  useEffect(() => {
    fetchCounts();

    const channel = supabase
      .channel('dashboard-counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const metrics = [
    { title: "Em Atendimento", value: counts.emAtendimento, icon: Users, description: "Leads ativos no processo", trend: { value: 12, isPositive: true }, variant: 'default' as const },
    { title: "Agendados", value: counts.agendados, icon: Calendar, description: "Consultas marcadas", trend: { value: 8, isPositive: true }, variant: 'success' as const },
    { title: "Remarketing", value: counts.remarketing, icon: TrendingUp, description: "Reativação de contatos", trend: { value: 5, isPositive: false }, variant: 'warning' as const },
    { title: "VENCEMOS! 🏆", value: counts.vencemos, icon: CheckCircle, description: "Casos finalizados com sucesso", trend: { value: 15, isPositive: true }, variant: 'success' as const },
    { title: "Perdidos", value: counts.perdidos, icon: XCircle, description: "Oportunidades não convertidas", trend: { value: 3, isPositive: false }, variant: 'destructive' as const },
  ];

  const conversionRate = counts.total > 0 ? ((counts.vencemos / counts.total) * 100).toFixed(1) : '0.0';

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
          Visão geral da jornada dos leads - {counts.total} leads ativos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{counts.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as oportunidades ativas</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Leads convertidos em casos</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{counts.remarketing}</div>
            <p className="text-xs text-muted-foreground mt-1">Disparos de remarketing agendados</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Distribuição dos Leads por Status</CardTitle>
          <p className="text-sm text-muted-foreground">Visualização da jornada atual dos clientes</p>
        </CardHeader>
        <CardContent>
          <LeadChart 
            emAtendimento={counts.emAtendimento}
            agendados={counts.agendados}
            remarketing={counts.remarketing}
            vencemos={counts.vencemos}
            perdidos={counts.perdidos}
          />
        </CardContent>
      </Card>
    </div>
  );
}
