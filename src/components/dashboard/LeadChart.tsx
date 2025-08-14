import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface ChatData {
  id: number;
  agendados: boolean;
  remarketing: boolean;
  vencemos: boolean;
  perdidos: boolean;
}

export function LeadChart() {
  const [chats, setChats] = useState<ChatData[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('id, agendados, remarketing, vencemos, perdidos');

      if (error) {
        console.error('Erro ao buscar dados para gráfico:', error);
        return;
      }

      setChats(data || []);
    };

    fetchChats();

    // Real-time updates
    const channel = supabase
      .channel('chart-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        () => {
          fetchChats(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calcular dados para o gráfico
  const emAtendimento = chats.filter(chat => 
    !chat.agendados && !chat.remarketing && !chat.vencemos && !chat.perdidos
  ).length;
  const agendados = chats.filter(chat => chat.agendados).length;
  const remarketingCount = chats.filter(chat => chat.remarketing).length;
  const vencemos = chats.filter(chat => chat.vencemos).length;
  const perdidos = chats.filter(chat => chat.perdidos).length;

  const data = [
    { name: 'Em Atendimento', value: emAtendimento, color: 'hsl(355, 85%, 45%)' },
    { name: 'Agendados', value: agendados, color: 'hsl(217, 91%, 60%)' },
    { name: 'Remarketing', value: remarketingCount, color: 'hsl(38, 92%, 50%)' },
    { name: 'VENCEMOS! 🏆', value: vencemos, color: 'hsl(142, 76%, 36%)' },
    { name: 'Perdidos', value: perdidos, color: 'hsl(355, 15%, 60%)' },
  ].filter(item => item.value > 0); // Só mostrar no gráfico se houver dados
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} leads`, '']}
            labelStyle={{ color: 'hsl(355, 25%, 15%)' }}
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(355, 15%, 90%)',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-card)'
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}