import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Move } from "lucide-react";

interface Column {
  id: string;
  title: string;
  color: string;
}

interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetStatus: string) => void;
  selectedCount: number;
  columns: Column[];
  isLoading?: boolean;
}

export function BulkMoveModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedCount, 
  columns, 
  isLoading = false 
}: BulkMoveModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus);
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="w-5 h-5" />
            Movimentação em Massa
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Badge variant="secondary" className="mb-4">
              {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Selecione o novo status para todos os leads marcados:
            </p>
          </div>
          
          <div className="space-y-2">
            {columns.map((column) => (
              <button
                key={column.id}
                onClick={() => setSelectedStatus(column.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedStatus === column.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span className="font-medium">{column.title}</span>
                  {selectedStatus === column.id && (
                    <CheckCircle className="w-4 h-4 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedStatus || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Move className="w-4 h-4" />
            )}
            Mover {selectedCount} Lead{selectedCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}