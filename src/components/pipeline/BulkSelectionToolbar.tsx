import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Move, CheckSquare, Square } from "lucide-react";

interface BulkSelectionToolbarProps {
  selectedCount: number;
  totalLeads: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMoveSelected: () => void;
  onCancel: () => void;
  allSelected: boolean;
}

export function BulkSelectionToolbar({
  selectedCount,
  totalLeads,
  onSelectAll,
  onDeselectAll,
  onMoveSelected,
  onCancel,
  allSelected
}: BulkSelectionToolbarProps) {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {selectedCount} de {totalLeads} lead{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            {allSelected ? (
              <>
                <Square className="w-4 h-4" />
                Desmarcar Todos
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                Selecionar Todos
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onMoveSelected}
            disabled={selectedCount === 0}
            className="gap-2"
            size="sm"
          >
            <Move className="w-4 h-4" />
            Mover Selecionados
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}