import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Phone, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

interface Column {
  id: string;
  title: string;
  color: string;
  leads: Lead[];
}

const getLeadStatus = (lead: Lead): string => {
  // Prioridade: agendados > reagendamento > remarketing > vencemos > perdidos > em_atendimento (padrão)
  if (lead.agendados) return 'agendado';
  if (lead.reagendamento) return 'reagendamento';
  if (lead.remarketing) return 'remarketing';
  if (lead.vencemos) return 'vencido';
  if (lead.perdidos) return 'perdido';
  // Se nenhum status específico estiver true, considera como em atendimento
  return 'em-atendimento';
};

const organizeLeadsByStatus = (leads: Lead[]): Column[] => {
  const columns: Column[] = [
    {
      id: 'em-atendimento',
      title: 'Em Atendimento',
      color: 'hsl(355, 85%, 45%)',
      leads: []
    },
    {
      id: 'agendado',
      title: 'Agendados',
      color: 'hsl(217, 91%, 60%)',
      leads: []
    },
    {
      id: 'reagendamento',
      title: 'Reagendamento',
      color: 'hsl(280, 85%, 65%)',
      leads: []
    },
    {
      id: 'remarketing',
      title: 'Remarketing',
      color: 'hsl(38, 92%, 50%)',
      leads: []
    },
    {
      id: 'vencido',
      title: 'VENCEMOS! 🏆',
      color: 'hsl(142, 76%, 36%)',
      leads: []
    },
    {
      id: 'perdido',
      title: 'Perdidos',
      color: 'hsl(355, 15%, 60%)',
      leads: []
    }
  ];

  leads.forEach(lead => {
    const status = getLeadStatus(lead);
    const column = columns.find(col => col.id === status);
    if (column) {
      column.leads.push(lead);
    }
  });

  return columns;
};

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    // Buscar dados iniciais
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar chats:', error);
        return;
      }

      setLeads(data || []);
    };

    fetchChats();

    // Configurar real-time updates
    const channel = supabase
      .channel('chats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads(prev => [payload.new as Lead, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLeads(prev => prev.map(lead => 
              lead.id === payload.new.id ? payload.new as Lead : lead
            ));
          } else if (payload.eventType === 'DELETE') {
            setLeads(prev => prev.filter(lead => lead.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setColumns(organizeLeadsByStatus(leads));
  }, [leads]);

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    // Resetar todos os status para false
    const statusUpdate = {
      em_atendimento: false,
      agendados: false,
      reagendamento: false,
      remarketing: false,
      vencemos: false,
      perdidos: false
    };

    // Definir o novo status como true
    switch (newStatus) {
      case 'em-atendimento':
        statusUpdate.em_atendimento = true;
        break;
      case 'agendado':
        statusUpdate.agendados = true;
        break;
      case 'reagendamento':
        statusUpdate.reagendamento = true;
        break;
      case 'remarketing':
        statusUpdate.remarketing = true;
        break;
      case 'vencido':
        statusUpdate.vencemos = true;
        break;
      case 'perdido':
        statusUpdate.perdidos = true;
        break;
    }

    const { error } = await supabase
      .from('chats')
      .update(statusUpdate)
      .eq('id', leadId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do lead');
      return false;
    }

    toast.success('Status do lead atualizado com sucesso!');
    return true;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não há destino, cancelar
    if (!destination) return;

    // Se o item foi solto na mesma posição, cancelar
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const leadId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Atualizar localmente primeiro para UX responsiva
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (sourceColumn && destColumn) {
      const leadToMove = sourceColumn.leads[source.index];
      
      // Remover do local original
      sourceColumn.leads.splice(source.index, 1);
      
      // Adicionar no novo local
      destColumn.leads.splice(destination.index, 0, leadToMove);
      
      setColumns([...columns]);

      // Atualizar no banco de dados
      const success = await updateLeadStatus(leadId, newStatus);
      
      if (!success) {
        // Se falhou, reverter a mudança local
        setColumns(organizeLeadsByStatus(leads));
      }
    }
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

  const getInitials = (name: string | null) => {
    if (!name) return 'NN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[600px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                    }`}
                  >
                    {column.leads.map((lead, leadIndex) => (
                      <Draggable key={lead.id} draggableId={lead.id.toString()} index={leadIndex}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-transform ${
                              snapshot.isDragging ? 'rotate-3 scale-105' : ''
                            }`}
                          >
                            <Card className="shadow-card hover:shadow-elegant transition-all duration-200 cursor-grab active:cursor-grabbing">
                              <CardHeader className="pb-3">
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
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    <span>{lead.telefone || 'Telefone não informado'}</span>
                                  </div>
                                  {lead.produto_juridico && (
                                    <div className="flex items-center gap-2">
                                      <Scale className="w-3 h-3 text-muted-foreground" />
                                      <span 
                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getServiceColor(lead.produto_juridico)}`}
                                      >
                                        {lead.produto_juridico}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(lead.created_at)}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Divisória vertical entre colunas */}
            {index < columns.length - 1 && (
              <div className="absolute top-0 right-[-12px] h-full w-px bg-border" />
            )}
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}