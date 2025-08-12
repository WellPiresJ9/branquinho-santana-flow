import { MetricCard } from "@/components/dashboard/MetricCard";
import { LeadChart } from "@/components/dashboard/LeadChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function Dashboard() {
  const metrics = [
    {
      title: "Em Atendimento",
      value: 35,
      icon: Users,
      description: "Leads ativos no processo",
      trend: { value: 12, isPositive: true },
      variant: 'default' as const
    },
    {
      title: "Agendados",
      value: 28,
      icon: Calendar,
      description: "Consultas marcadas",
      trend: { value: 8, isPositive: true },
      variant: 'success' as const
    },
    {
      title: "Remarketing",
      value: 15,
      icon: TrendingUp,
      description: "Reativação de contatos",
      trend: { value: 5, isPositive: false },
      variant: 'warning' as const
    },
    {
      title: "Vencidos",
      value: 12,
      icon: CheckCircle,
      description: "Casos finalizados com sucesso",
      trend: { value: 15, isPositive: true },
      variant: 'success' as const
    },
    {
      title: "Perdidos",
      value: 10,
      icon: XCircle,
      description: "Oportunidades não convertidas",
      trend: { value: 3, isPositive: false },
      variant: 'destructive' as const
    }
  ];

  const totalLeads = metrics.reduce((sum, metric) => sum + metric.value, 0);
  const conversionRate = ((metrics[3].value / totalLeads) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da jornada dos leads
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