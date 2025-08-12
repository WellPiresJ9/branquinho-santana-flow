import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Phone, Mail } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  value: number;
  createdAt: string;
  lastContact: string;
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
        email: 'maria@email.com',
        phone: '(11) 99999-9999',
        value: 5000,
        createdAt: '2024-01-15',
        lastContact: '2024-01-20',
        status: 'em-atendimento'
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao@email.com',
        phone: '(11) 88888-8888',
        value: 3500,
        createdAt: '2024-01-18',
        lastContact: '2024-01-19',
        status: 'em-atendimento'
      }
    ]
  },
  {
    id: 'agendado',
    title: 'Agendados',
    color: 'hsl(142, 76%, 36%)',
    leads: [
      {
        id: '3',
        name: 'Ana Costa',
        email: 'ana@email.com',
        phone: '(11) 77777-7777',
        value: 8000,
        createdAt: '2024-01-10',
        lastContact: '2024-01-21',
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
        email: 'pedro@email.com',
        phone: '(11) 66666-6666',
        value: 4200,
        createdAt: '2024-01-05',
        lastContact: '2024-01-15',
        status: 'remarketing'
      }
    ]
  },
  {
    id: 'vencido',
    title: 'Vencidos',
    color: 'hsl(355, 85%, 65%)',
    leads: [
      {
        id: '5',
        name: 'Carlos Lima',
        email: 'carlos@email.com',
        phone: '(11) 55555-5555',
        value: 6500,
        createdAt: '2024-01-01',
        lastContact: '2024-01-22',
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
        email: 'lucia@email.com',
        phone: '(11) 44444-4444',
        value: 2800,
        createdAt: '2023-12-28',
        lastContact: '2024-01-10',
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
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
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(lead.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Último contato: {formatDate(lead.lastContact)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}