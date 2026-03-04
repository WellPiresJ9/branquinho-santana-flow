import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Phone, Scale } from "lucide-react";

interface Lead {
  id: number;
  nome: string | null;
  telefone: string | null;
  produto_juridico: string | null;
  created_at: string;
  em_atendimento: boolean;
  agendados: boolean;
  remarketing: boolean;
  reagendamento: boolean;
  vencemos: boolean;
  perdidos: boolean;
  responsavel: string | null;
  status: string | null;
  hora_reuniao?: string | null;
}

interface LeadCardProps {
  lead: Lead;
  provided: any;
  snapshot: any;
  isBulkMode: boolean;
  isSelected: boolean;
  onSelectionChange: (leadId: number, selected: boolean) => void;
}

const SERVICE_COLORS: { [key: string]: string } = {
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

function LeadCardInner({ 
  lead, 
  provided, 
  snapshot, 
  isBulkMode, 
  isSelected, 
  onSelectionChange 
}: LeadCardProps) {
  const getDisplayDate = () => {
    if (lead.agendados && lead.hora_reuniao) {
      const date = new Date(lead.hora_reuniao);
      return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return new Date(lead.created_at).toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'NN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(lead.id, !isSelected);
  };

  const serviceColor = lead.produto_juridico 
    ? SERVICE_COLORS[lead.produto_juridico] || 'bg-muted text-muted-foreground border-border'
    : '';

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...(!isBulkMode ? provided.dragHandleProps : {})}
      className={`transition-transform ${
        snapshot.isDragging ? 'rotate-3 scale-105' : ''
      }`}
    >
      <Card className={`relative shadow-card hover:shadow-elegant transition-all duration-200 ${
        isBulkMode 
          ? `cursor-pointer ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'}` 
          : 'cursor-grab active:cursor-grabbing'
      }`}>
        {isBulkMode && (
          <div 
            className="absolute top-3 left-3 z-10"
            onClick={handleCheckboxChange}
          >
            <Checkbox 
              checked={isSelected}
              className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        )}
        
        <CardHeader className={`pb-3 ${isBulkMode ? 'pl-10' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(lead.nome)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-medium">
                  {lead.nome || 'Nome não informado'}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`pt-0 ${isBulkMode ? 'pl-10' : ''}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{lead.telefone || 'Telefone não informado'}</span>
            </div>
            {lead.produto_juridico && (
              <div className="flex items-center gap-2">
                <Scale className="w-3 h-3 text-muted-foreground" />
                <span 
                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${serviceColor}`}
                >
                  {lead.produto_juridico}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{getDisplayDate()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const LeadCard = React.memo(LeadCardInner);
