import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Phone, Scale } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  value: number;
  createdAt: string;
  produtoJuridico: string;
  status: 'em-atendimento' | 'agendado' | 'remarketing' | 'vencido' | 'perdido';
}

interface Column {
  id: string;
  title: string;
  color: string;
  leads: Lead[];
}

const mockData: Column[] = [
  {
    id: 'em-atendimento',
    title: 'Em Atendimento',
    color: 'hsl(355, 85%, 45%)',
    leads: [
      {
        id: '1',
        name: 'Maria Silva',
        phone: '(11) 99999-9999',
        value: 5000,
        createdAt: '2024-01-15',
        produtoJuridico: 'Rescisão Trabalhista',
        status: 'em-atendimento'
      },
      {
        id: '2',
        name: 'João Santos',
        phone: '(11) 88888-8888',
        value: 3500,
        createdAt: '2024-01-18',
        produtoJuridico: 'Ação de Cobrança',
        status: 'em-atendimento'
      },
      {
        id: '7',
        name: 'Roberto Silva',
        phone: '(11) 91234-5678',
        value: 4000,
        createdAt: '2024-01-19',
        produtoJuridico: 'Inventário',
        status: 'em-atendimento'
      }
    ]
  },
  {
    id: 'agendado',
    title: 'Agendados',
    color: 'hsl(217, 91%, 60%)',
    leads: [
      {
        id: '3',
        name: 'Ana Costa',
        phone: '(11) 77777-7777',
        value: 8000,
        createdAt: '2024-01-10',
        produtoJuridico: 'Constituição de Empresa',
        status: 'agendado'
      },
      {
        id: '8',
        name: 'Fernando Oliveira',
        phone: '(11) 98765-4321',
        value: 6000,
        createdAt: '2024-01-12',
        produtoJuridico: 'Usucapião',
        status: 'agendado'
      }
    ]
  },
  {
    id: 'remarketing',
    title: 'Remarketing',
    color: 'hsl(38, 92%, 50%)',
    leads: [
      {
        id: '4',
        name: 'Pedro Oliveira',
        phone: '(11) 66666-6666',
        value: 4200,
        createdAt: '2024-01-05',
        produtoJuridico: 'Aposentadoria por Tempo',
        status: 'remarketing'
      },
      {
        id: '9',
        name: 'Sandra Lima',
        phone: '(11) 87654-3210',
        value: 3800,
        createdAt: '2024-01-08',
        produtoJuridico: 'Revisão de Aposentadoria',
        status: 'remarketing'
      }
    ]
  },
  {
    id: 'vencido',
    title: 'VENCEMOS! 🏆',
    color: 'hsl(142, 76%, 36%)',
    leads: [
      {
        id: '5',
        name: 'Carlos Lima',
        phone: '(11) 55555-5555',
        value: 6500,
        createdAt: '2024-01-01',
        produtoJuridico: 'Defesa Criminal',
        status: 'vencido'
      },
      {
        id: '10',
        name: 'Mariana Santos',
        phone: '(11) 76543-2109',
        value: 5500,
        createdAt: '2024-01-03',
        produtoJuridico: 'Ação Trabalhista',
        status: 'vencido'
      }
    ]
  },
  {
    id: 'perdido',
    title: 'Perdidos',
    color: 'hsl(355, 15%, 60%)',
    leads: [
      {
        id: '6',
        name: 'Lucia Mendes',
        phone: '(11) 44444-4444',
        value: 2800,
        createdAt: '2023-12-28',
        produtoJuridico: 'Divórcio Consensual',
        status: 'perdido'
      },
      {
        id: '11',
        name: 'Ricardo Souza',
        phone: '(11) 65432-1098',
        value: 3200,
        createdAt: '2023-12-30',
        produtoJuridico: 'Regularização Imobiliária',
        status: 'perdido'
      }
    ]
  }
];

export function KanbanBoard() {
  const [columns] = useState<Column[]>(mockData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getServiceColor = (service: string) => {
    const serviceColors: { [key: string]: string } = {
      'Rescisão Trabalhista': 'bg-primary/10 text-primary border-primary/20',
      'Ação de Cobrança': 'bg-success/10 text-success border-success/20',
      'Constituição de Empresa': 'bg-accent text-accent-foreground border-accent',
      'Aposentadoria por Tempo': 'bg-warning/10 text-warning border-warning/20',
      'Defesa Criminal': 'bg-destructive/10 text-destructive border-destructive/20',
      'Divórcio Consensual': 'bg-primary/20 text-primary border-primary/30',
      'Inventário': 'bg-muted text-muted-foreground border-border',
      'Usucapião': 'bg-secondary text-secondary-foreground border-secondary',
      'Revisão de Aposentadoria': 'bg-warning/20 text-warning border-warning/30',
      'Ação Trabalhista': 'bg-success/20 text-success border-success/30',
      'Regularização Imobiliária': 'bg-accent/50 text-accent-foreground border-accent'
    };
    return serviceColors[service] || 'bg-muted text-muted-foreground border-border';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {columns.map((column, index) => (
        <div key={column.id} className="relative">
          <div className="flex-shrink-0 w-80">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {column.leads.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 min-h-[600px]">
              {column.leads.map((lead) => (
                <Card key={lead.id} className="shadow-card hover:shadow-elegant transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {lead.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="w-3 h-3 text-muted-foreground" />
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getServiceColor(lead.produtoJuridico)}`}
                        >
                          {lead.produtoJuridico}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Divisória vertical entre colunas */}
          {index < columns.length - 1 && (
            <div className="absolute top-0 right-[-12px] h-full w-px bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}