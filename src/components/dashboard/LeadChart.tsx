import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Em Atendimento', value: 35, color: 'hsl(355, 85%, 45%)' },
  { name: 'Agendados', value: 28, color: 'hsl(142, 76%, 36%)' },
  { name: 'Remarketing', value: 15, color: 'hsl(38, 92%, 50%)' },
  { name: 'Vencidos', value: 12, color: 'hsl(355, 85%, 65%)' },
  { name: 'Perdidos', value: 10, color: 'hsl(355, 15%, 60%)' },
];

export function LeadChart() {
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