import { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users2, CheckSquare, ChevronDown, Download, Mail, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeadCard } from "./LeadCard";
import { BulkSelectionToolbar } from "./BulkSelectionToolbar";
import { BulkMoveModal } from "./BulkMoveModal";
import { DaySelector } from "./DaySelector";
import * as XLSX from 'xlsx';

interface Lead {
  id: number;
  nome: string | null;
  telefone: string | null;
  produto_juridico: string | null;
  created_at: string;
  em_atendimento: boolean | null;
  agendados: boolean | null;
  remarketing: boolean | null;
  remarketing_pedro: boolean | null;
  remarketing_julianny: boolean | null;
  reagendamento: boolean | null;
  vencemos: boolean | null;
  perdidos: boolean | null;
  responsavel: string | null;
  status: string | null;
  hora_reuniao?: string | null;
  "mensagem-remarketing-enviada"?: boolean | null;
  "mensagem-reagendamento-enviada"?: boolean | null;
}

interface Column {
  id: string;
  title: string;
  color: string;
  leads: Lead[];
}

const LEADS_PER_PAGE = 50;

const SELECTED_COLUMNS = 'id, nome, telefone, produto_juridico, created_at, em_atendimento, agendados, remarketing, remarketing_pedro, remarketing_julianny, reagendamento, vencemos, perdidos, responsavel, status, hora_reuniao, "mensagem-remarketing-enviada", "mensagem-reagendamento-enviada"';

const getLeadStatus = (lead: Lead): string => {
  if (lead.agendados ?? false) return 'agendado';
  if (lead.reagendamento ?? false) return 'reagendamento'; 
  if (lead.remarketing ?? false) return 'remarketing';
  if (lead.remarketing_pedro ?? false) return 'remarketing-pedro';
  if (lead.remarketing_julianny ?? false) return 'remarketing-julianny';
  if (lead.vencemos ?? false) return 'vencido';
  if (lead.perdidos ?? false) return 'perdido';
  return 'em-atendimento';
};

const COLUMN_DEFINITIONS: Omit<Column, 'leads'>[] = [
  { id: 'em-atendimento', title: 'Em Atendimento', color: 'hsl(355, 85%, 45%)' },
  { id: 'agendado', title: 'Agendados', color: 'hsl(217, 91%, 60%)' },
  { id: 'reagendamento', title: 'Reagendamento', color: 'hsl(280, 85%, 65%)' },
  { id: 'remarketing', title: 'Remarketing', color: 'hsl(38, 92%, 50%)' },
  { id: 'remarketing-pedro', title: 'Remarketing Pedro', color: 'hsl(200, 85%, 55%)' },
  { id: 'remarketing-julianny', title: 'Remarketing Julianny', color: 'hsl(320, 85%, 60%)' },
  { id: 'vencido', title: 'VENCEMOS! 🏆', color: 'hsl(142, 76%, 36%)' },
  { id: 'perdido', title: 'Perdidos', color: 'hsl(355, 15%, 60%)' },
];

const organizeLeadsByStatus = (leads: Lead[]): Column[] => {
  const columns: Column[] = COLUMN_DEFINITIONS.map(def => ({ ...def, leads: [] }));

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
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  
  // Estados para movimentação em massa
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedDayByColumn, setSelectedDayByColumn] = useState<Record<string, number>>({});
  const [selectedMonthByColumn, setSelectedMonthByColumn] = useState<Record<string, number>>({});
  const [selectedYearByColumn, setSelectedYearByColumn] = useState<Record<string, number>>({});
  const [quantityByColumn, setQuantityByColumn] = useState<Record<string, string>>({});
  const [filterRmktByColumn, setFilterRmktByColumn] = useState<Record<string, boolean>>({});
  const [filterReagByColumn, setFilterReagByColumn] = useState<Record<string, boolean>>({});
  const [showHighVolumeConfirm, setShowHighVolumeConfirm] = useState(false);
  const [pendingBulkTarget, setPendingBulkTarget] = useState<string>('');

  useEffect(() => {
    const fetchAllChats = async () => {
      const BATCH_SIZE = 1000;
      let allLeads: Lead[] = [];
      let hasMore = true;
      let offset = 0;

      try {
        while (hasMore) {
          const { data, error } = await supabase
            .from('chats')
            .select(SELECTED_COLUMNS)
            .range(offset, offset + BATCH_SIZE - 1)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Erro ao buscar chats:', error);
            break;
          }

          if (data && data.length > 0) {
            allLeads = [...allLeads, ...(data as Lead[])];
            offset += BATCH_SIZE;
            if (data.length < BATCH_SIZE) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        setLeads(allLeads);
      } catch (err) {
        console.error('Erro ao buscar todos os chats:', err);
      }
    };

    fetchAllChats();

    const channel = supabase
      .channel('chats-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads(prev => [payload.new as Lead, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Lead;
            setLeads(prev => prev.map(lead => lead.id === updated.id ? updated : lead));
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
    const filteredLeads = leads.filter(lead => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nome = (lead.nome || '').toLowerCase();
        const telefone = (lead.telefone || '').toLowerCase();
        if (!nome.includes(searchLower) && !telefone.includes(searchLower)) {
          return false;
        }
      }

      if (selectedMonths.length > 0) {
        const createdDate = new Date(lead.created_at);
        const createdMonth = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        let matchesCreatedDate = selectedMonths.includes(createdMonth);
        let matchesAppointmentDate = false;
        if (lead.hora_reuniao) {
          try {
            const appointmentDate = new Date(lead.hora_reuniao);
            const appointmentMonth = `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, '0')}`;
            matchesAppointmentDate = selectedMonths.includes(appointmentMonth);
          } catch (e) {}
        }
        if (!matchesCreatedDate && !matchesAppointmentDate) {
          return false;
        }
      }

      return true;
    });
    
    setColumns(organizeLeadsByStatus(filteredLeads));
  }, [leads, searchTerm, selectedMonths]);

  const getVisibleCount = useCallback((columnId: string) => {
    return visibleCounts[columnId] || LEADS_PER_PAGE;
  }, [visibleCounts]);

  const handleLoadMore = useCallback((columnId: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [columnId]: (prev[columnId] || LEADS_PER_PAGE) + LEADS_PER_PAGE
    }));
  }, []);

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    const statusUpdate = {
      em_atendimento: false,
      agendados: false,
      reagendamento: false,
      remarketing: false,
      remarketing_pedro: false,
      remarketing_julianny: false,
      vencemos: false,
      perdidos: false
    };

    switch (newStatus) {
      case 'em-atendimento': statusUpdate.em_atendimento = true; break;
      case 'agendado': statusUpdate.agendados = true; break;
      case 'reagendamento': statusUpdate.reagendamento = true; break;
      case 'remarketing': statusUpdate.remarketing = true; break;
      case 'remarketing-pedro': statusUpdate.remarketing_pedro = true; break;
      case 'remarketing-julianny': statusUpdate.remarketing_julianny = true; break;
      case 'vencido': statusUpdate.vencemos = true; break;
      case 'perdido': statusUpdate.perdidos = true; break;
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
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (sourceColumn && destColumn) {
      const leadToMove = sourceColumn.leads[source.index];
      sourceColumn.leads.splice(source.index, 1);
      destColumn.leads.splice(destination.index, 0, leadToMove);
      setColumns([...columns]);

      const success = await updateLeadStatus(leadId, newStatus);
      if (!success) {
        setColumns(organizeLeadsByStatus(leads));
      }
    }
  };

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedLeads(new Set());
    setSelectedDayByColumn({});
    setSelectedMonthByColumn({});
    setSelectedYearByColumn({});
    setFilterRmktByColumn({});
    setFilterReagByColumn({});
    setQuantityByColumn({});
  };

  const handleLeadSelection = useCallback((leadId: number, selected: boolean) => {
    setSelectedLeads(prev => {
      const newSelected = new Set(prev);
      if (selected) {
        newSelected.add(leadId);
      } else {
        newSelected.delete(leadId);
      }
      return newSelected;
    });
  }, []);

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
        if (success) successCount++;
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

  const handleDaySelection = (columnId: string, day: number, month: number, year: number) => {
    if (selectedDayByColumn[columnId] === day && selectedMonthByColumn[columnId] === month && selectedYearByColumn[columnId] === year) {
      setSelectedDayByColumn(prev => { const u = { ...prev }; delete u[columnId]; return u; });
      setSelectedMonthByColumn(prev => { const u = { ...prev }; delete u[columnId]; return u; });
      setSelectedYearByColumn(prev => { const u = { ...prev }; delete u[columnId]; return u; });
    } else {
      setSelectedDayByColumn(prev => ({ ...prev, [columnId]: day }));
      setSelectedMonthByColumn(prev => ({ ...prev, [columnId]: month }));
      setSelectedYearByColumn(prev => ({ ...prev, [columnId]: year }));
    }
  };

  const handleCombinedSelect = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    const filterRmkt = filterRmktByColumn[columnId] || false;
    const filterReag = filterReagByColumn[columnId] || false;
    const day = selectedDayByColumn[columnId];
    const month = selectedMonthByColumn[columnId];
    const year = selectedYearByColumn[columnId];
    const quantity = parseInt(quantityByColumn[columnId] || "0");

    let filtered = [...column.leads];

    // Filter by message sent
    if (filterRmkt) {
      filtered = filtered.filter(l => l["mensagem-remarketing-enviada"]);
    }
    if (filterReag) {
      filtered = filtered.filter(l => l["mensagem-reagendamento-enviada"]);
    }

    // Filter by day
    if (day !== undefined && month !== undefined && year !== undefined) {
      filtered = filtered.filter(lead => {
        const createdDate = new Date(lead.created_at);
        const isCreatedOnDay = createdDate.getDate() === day && 
                              createdDate.getMonth() === month && 
                              createdDate.getFullYear() === year;
        if (lead.hora_reuniao) {
          try {
            const appointmentDate = new Date(lead.hora_reuniao);
            const isAppointmentOnDay = appointmentDate.getDate() === day && 
                                       appointmentDate.getMonth() === month && 
                                       appointmentDate.getFullYear() === year;
            return isCreatedOnDay || isAppointmentOnDay;
          } catch (e) {
            return isCreatedOnDay;
          }
        }
        return isCreatedOnDay;
      });
    }

    // Limit by quantity
    if (quantity > 0) {
      filtered = filtered.slice(0, quantity);
    }

    if (filtered.length === 0) {
      toast.error('Nenhum lead encontrado com os filtros selecionados');
      return;
    }

    // Keep selections from other columns
    const newSelected = new Set<number>();
    selectedLeads.forEach(leadId => {
      const lead = leads.find(l => l.id === leadId);
      if (lead && getLeadStatus(lead) !== columnId) {
        newSelected.add(leadId);
      }
    });

    filtered.forEach(l => newSelected.add(l.id));
    setSelectedLeads(newSelected);

    toast.success(`${filtered.length} lead${filtered.length !== 1 ? 's' : ''} selecionado${filtered.length !== 1 ? 's' : ''} em ${column.title}`);
  };

  const allLeadsSelected = leads.length > 0 && selectedLeads.size === leads.length;

  const handleDownloadColumn = useCallback((column: Column) => {
    if (column.leads.length === 0) {
      toast.error(`Nenhum contato na etapa "${column.title}"`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      column.leads.map(lead => ({
        'Nome': lead.nome || 'Sem nome',
        'Telefone': lead.telefone ? lead.telefone.replace('@s.whatsapp.net', '') : 'Sem telefone',
        'Produto Jurídico': lead.produto_juridico || '',
        'Data': new Date(lead.created_at).toLocaleDateString('pt-BR'),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, column.title.substring(0, 31));

    const fileName = `${column.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`${column.leads.length} contato${column.leads.length !== 1 ? 's' : ''} exportado${column.leads.length !== 1 ? 's' : ''} de "${column.title}"!`);
  }, []);

  return (
    <div className="space-y-6">
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

      <DragDropContext onDragEnd={isBulkMode ? () => {} : handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((column, index) => {
            const visibleCount = getVisibleCount(column.id);
            const visibleLeads = column.leads.slice(0, visibleCount);
            const remainingCount = column.leads.length - visibleCount;

            return (
              <div key={column.id} className="relative">
                <div className="flex-shrink-0 w-80 h-[calc(100vh-280px)] min-h-0 flex flex-col">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDownloadColumn(column)}
                        title={`Exportar ${column.title}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    
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
                        
                        {/* Combined filters */}
                        <div className="border border-border rounded-lg p-2 space-y-2 bg-muted/20">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Filtros combinados</p>
                          
                          <DaySelector 
                            onSelectDay={(day, month, year) => handleDaySelection(column.id, day, month, year)}
                            selectedDay={selectedDayByColumn[column.id]}
                            selectedMonth={selectedMonthByColumn[column.id]}
                            selectedYear={selectedYearByColumn[column.id]}
                          />

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <Checkbox
                                id={`rmkt-${column.id}`}
                                checked={filterRmktByColumn[column.id] || false}
                                onCheckedChange={(checked) => setFilterRmktByColumn(prev => ({ ...prev, [column.id]: !!checked }))}
                                className="h-3.5 w-3.5"
                              />
                              <Label htmlFor={`rmkt-${column.id}`} className="text-[10px] cursor-pointer flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5" />
                                Rmkt
                              </Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Checkbox
                                id={`reag-${column.id}`}
                                checked={filterReagByColumn[column.id] || false}
                                onCheckedChange={(checked) => setFilterReagByColumn(prev => ({ ...prev, [column.id]: !!checked }))}
                                className="h-3.5 w-3.5"
                              />
                              <Label htmlFor={`reag-${column.id}`} className="text-[10px] cursor-pointer flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5" />
                                Reag.
                              </Label>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              max={column.leads.length}
                              placeholder="Qtd. (opcional)"
                              value={quantityByColumn[column.id] || ""}
                              onChange={(e) => setQuantityByColumn(prev => ({ ...prev, [column.id]: e.target.value }))}
                              className="text-xs h-8"
                            />
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCombinedSelect(column.id)}
                              className="text-xs h-8"
                            >
                              Aplicar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-h-0">
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`kanban-column-scroll h-full space-y-3 min-h-full p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'bg-muted/50' : ''
                          }`}
                        >
                          {visibleLeads.map((lead, leadIndex) => (
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
                          
                          {remainingCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadMore(column.id)}
                              className="w-full text-xs text-muted-foreground gap-1"
                            >
                              <ChevronDown className="w-3 h-3" />
                              Carregar mais ({remainingCount} restantes)
                            </Button>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
                
                {index < columns.length - 1 && (
                  <div className="absolute top-0 right-[-12px] h-full w-px bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>

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
