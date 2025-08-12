import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

export default function Pipeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie o funil de conversão dos seus leads
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <p className="text-sm text-muted-foreground">
            Arraste os cards entre as colunas para atualizar o status dos leads
          </p>
        </CardHeader>
        <CardContent>
          <KanbanBoard />
        </CardContent>
      </Card>
    </div>
  );
}