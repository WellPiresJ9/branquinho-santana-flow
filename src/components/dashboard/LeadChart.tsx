import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LeadChartProps {
  emAtendimento: number;
  agendados: number;
  remarketing: number;
  vencemos: number;
  perdidos: number;
}

export function LeadChart({ emAtendimento, agendados, remarketing, vencemos, perdidos }: LeadChartProps) {
  const data = [
    { name: 'Em Atendimento', value: emAtendimento, color: 'hsl(355, 85%, 45%)' },
    { name: 'Agendados', value: agendados, color: 'hsl(217, 91%, 60%)' },
    { name: 'Remarketing', value: remarketing, color: 'hsl(38, 92%, 50%)' },
    { name: 'VENCEMOS! 🏆', value: vencemos, color: 'hsl(142, 76%, 36%)' },
    { name: 'Perdidos', value: perdidos, color: 'hsl(355, 15%, 60%)' },
  ].filter(item => item.value > 0);

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
