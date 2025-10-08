import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users2, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeadCard } from "./LeadCard";
import { BulkSelectionToolbar } from "./BulkSelectionToolbar";
import { BulkMoveModal } from "./BulkMoveModal";
import { DaySelector } from "./DaySelector";

interface Lead {
  id: number;
  nome: string | null;
  telefone: string | null;
  produto_juridico: string | null;
  created_at: string;
  em_atendimento: boolean | null;
  agendados: boolean | null;
  remarketing: boolean | null;
  reagendamento: boolean | null;
  vencemos: boolean | null;
  perdidos: boolean | null;
  responsavel: string | null;
  status: string | null;
  hora_reuniao?: string | null;
  "mensagem-confirmacao-enviada"?: boolean | null;
  "mensagem-reagendamento-enviada"?: boolean | null;
  "mensagem-remarketing-enviada"?: boolean | null;  
  "reuniao-confirmada"?: boolean | null;
}

interface Column {
  id: string;
  title: string;
  color: string;
  leads: Lead[];
}

const getLeadStatus = (lead: Lead): string => {
  // Prioridade: agendados > reagendamento > remarketing > vencemos > perdidos > em_atendimento (padrão)
  // MANTENDO A LÓGICA EXATA - apenas tratando valores null como false
  if (lead.agendados ?? false) return 'agendado';
  if (lead.reagendamento ?? false) return 'reagendamento'; 
  if (lead.remarketing ?? false) return 'remarketing';
  if (lead.vencemos ?? false) return 'vencido';
  if (lead.perdidos ?? false) return 'perdido';
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

interface KanbanBoardProps {
  searchTerm?: string;
  selectedMonths?: string[];
}

export function KanbanBoard({ searchTerm = "", selectedMonths = [] }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  
  // Estados para movimentação em massa
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedDayByColumn, setSelectedDayByColumn] = useState<Record<string, number>>({});

  useEffect(() => {
    // Buscar TODOS os dados com paginação (Supabase tem limite de 1000 por query)
    const fetchAllChats = async () => {
      const BATCH_SIZE = 1000;
      let allLeads: Lead[] = [];
      let hasMore = true;
      let offset = 0;

      try {
        while (hasMore) {
          const { data, error } = await supabase
            .from('chats')
            .select('*')
            .range(offset, offset + BATCH_SIZE - 1)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Erro ao buscar chats:', error);
            break;
          }

          if (data && data.length > 0) {
            allLeads = [...allLeads, ...data];
            offset += BATCH_SIZE;
            
            // Se retornou menos que BATCH_SIZE, não há mais dados
            if (data.length < BATCH_SIZE) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        console.log(`✅ Total de leads carregados: ${allLeads.length}`);
        setLeads(allLeads);
      } catch (err) {
        console.error('Erro ao buscar todos os chats:', err);
      }
    };

    fetchAllChats();

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
    // Filtrar leads baseado no termo de pesquisa e meses selecionados
    const filteredLeads = leads.filter(lead => {
      // Filtro de pesquisa
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nome = (lead.nome || '').toLowerCase();
        const telefone = (lead.telefone || '').toLowerCase();
        
        if (!nome.includes(searchLower) && !telefone.includes(searchLower)) {
          return false;
        }
      }

      // Filtro de meses
      if (selectedMonths.length > 0) {
        const createdDate = new Date(lead.created_at);
        const createdMonth = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Verificar se a data de criação está nos meses selecionados
        let matchesCreatedDate = selectedMonths.includes(createdMonth);
        
        // Se tem hora de reunião, verificar também essa data
        let matchesAppointmentDate = false;
        if (lead.hora_reuniao) {
          try {
            const appointmentDate = new Date(lead.hora_reuniao);
            const appointmentMonth = `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, '0')}`;
            matchesAppointmentDate = selectedMonths.includes(appointmentMonth);
          } catch (e) {
            // Se falhar ao parsear a data de agendamento, ignorar
          }
        }
        
        // Lead deve estar em pelo menos um dos meses selecionados (criação OU agendamento)
        if (!matchesCreatedDate && !matchesAppointmentDate) {
          return false;
        }
      }

      return true;
    });
    
    const newColumns = organizeLeadsByStatus(filteredLeads);
    
    // Log temporário para validar contagens (será removido após confirmação)
    console.log('🔍 Validação de contagens após correção:');
    newColumns.forEach(col => {
      console.log(`${col.title}: ${col.leads.length} leads`);
    });
    console.log(`Total de leads filtrados: ${filteredLeads.length}`);
    
    setColumns(newColumns);
  }, [leads, searchTerm, selectedMonths]);

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

  // Funções para movimentação em massa
  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedLeads(new Set());
    setSelectedDayByColumn({});
  };

  const handleLeadSelection = (leadId: number, selected: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (selected) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const selectAllLeads = () => {
    const allLeadIds = new Set(leads.map(lead => lead.id));
    setSelectedLeads(allLeadIds);
  };

  const deselectAllLeads = () => {
    setSelectedLeads(new Set());
  };

  const handleBulkMove = async (targetStatus: string) => {
    if (selectedLeads.size === 0) return;

    setIsMoving(true);
    let successCount = 0;
    const totalLeads = selectedLeads.size;

    try {
      for (const leadId of selectedLeads) {
        const success = await updateLeadStatus(leadId, targetStatus);
        if (success) {
          successCount++;
        }
      }

      if (successCount === totalLeads) {
        toast.success(`${totalLeads} lead${totalLeads !== 1 ? 's' : ''} movido${totalLeads !== 1 ? 's' : ''} com sucesso!`);
      } else {
        toast.warning(`${successCount} de ${totalLeads} leads foram movidos. ${totalLeads - successCount} falharam.`);
      }
    } catch (error) {
      toast.error('Erro ao mover leads');
    } finally {
      setIsMoving(false);
      setShowBulkModal(false);
      setSelectedLeads(new Set());
      setIsBulkMode(false);
    }
  };

  const handleSelectByDay = (columnId: string, day: number) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    // Atualizar o dia selecionado para esta coluna
    setSelectedDayByColumn(prev => ({
      ...prev,
      [columnId]: day
    }));

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const leadsFromDay = column.leads.filter(lead => {
      const createdDate = new Date(lead.created_at);
      const isCreatedOnDay = createdDate.getDate() === day && 
                            createdDate.getMonth() === currentMonth && 
                            createdDate.getFullYear() === currentYear;
      
      // Verificar também a data de agendamento se existir
      if (lead.hora_reuniao) {
        try {
          const appointmentDate = new Date(lead.hora_reuniao);
          const isAppointmentOnDay = appointmentDate.getDate() === day && 
                                     appointmentDate.getMonth() === currentMonth && 
                                     appointmentDate.getFullYear() === currentYear;
          return isCreatedOnDay || isAppointmentOnDay;
        } catch (e) {
          return isCreatedOnDay;
        }
      }
      
      return isCreatedOnDay;
    });

    const newSelected = new Set(selectedLeads);
    leadsFromDay.forEach(lead => newSelected.add(lead.id));
    setSelectedLeads(newSelected);
    
    toast.success(`${leadsFromDay.length} lead${leadsFromDay.length !== 1 ? 's' : ''} do dia ${day} selecionado${leadsFromDay.length !== 1 ? 's' : ''}!`);
  };

  const allLeadsSelected = leads.length > 0 && selectedLeads.size === leads.length;

  return (
    <div className="space-y-6">
      {/* Header com botão de movimentação em massa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Funil de Conversão</h2>
          <Badge variant="outline">
            {leads.length} leads totais
          </Badge>
        </div>
        
        <Button
          onClick={toggleBulkMode}
          variant={isBulkMode ? "default" : "outline"}
          className="gap-2"
        >
          {isBulkMode ? <CheckSquare className="w-4 h-4" /> : <Users2 className="w-4 h-4" />}
          {isBulkMode ? 'Modo Seleção Ativo' : 'Movimentação em Massa'}
        </Button>
      </div>

      {/* Toolbar de seleção em massa */}
      {isBulkMode && (
        <BulkSelectionToolbar
          selectedCount={selectedLeads.size}
          totalLeads={leads.length}
          onSelectAll={selectAllLeads}
          onDeselectAll={deselectAllLeads}
          onMoveSelected={() => setShowBulkModal(true)}
          onCancel={() => {
            setIsBulkMode(false);
            setSelectedLeads(new Set());
          }}
          allSelected={allLeadsSelected}
        />
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={isBulkMode ? () => {} : handleDragEnd}>
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
                  
                  {/* Botões de seleção no modo bulk */}
                  {isBulkMode && column.leads.length > 0 && (
                    <div className="space-y-2 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const columnLeadIds = column.leads.map(lead => lead.id);
                          const allColumnSelected = columnLeadIds.every(id => selectedLeads.has(id));
                          
                          const newSelected = new Set(selectedLeads);
                          if (allColumnSelected) {
                            columnLeadIds.forEach(id => newSelected.delete(id));
                          } else {
                            columnLeadIds.forEach(id => newSelected.add(id));
                          }
                          setSelectedLeads(newSelected);
                        }}
                        className="w-full text-xs"
                      >
                        {column.leads.every(lead => selectedLeads.has(lead.id)) ? 
                          'Desmarcar Coluna' : 'Selecionar Coluna'
                        }
                      </Button>
                      
                      <DaySelector 
                        onSelectDay={(day) => handleSelectByDay(column.id, day)}
                        selectedDay={selectedDayByColumn[column.id]}
                      />
                    </div>
                  )}
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
                        <Draggable 
                          key={lead.id} 
                          draggableId={lead.id.toString()} 
                          index={leadIndex}
                          isDragDisabled={isBulkMode}
                        >
                          {(provided, snapshot) => (
                            <LeadCard
                              lead={lead}
                              provided={provided}
                              snapshot={snapshot}
                              isBulkMode={isBulkMode}
                              isSelected={selectedLeads.has(lead.id)}
                              onSelectionChange={handleLeadSelection}
                            />
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

      {/* Modal de movimentação em massa */}
      <BulkMoveModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onConfirm={handleBulkMove}
        selectedCount={selectedLeads.size}
        columns={columns}
        isLoading={isMoving}
      />
    </div>
  );
}