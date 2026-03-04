import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthFilter } from "@/components/pipeline/MonthFilter";
import { Plus, Filter, Search } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Pipeline() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadRemarketing}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Baixando...' : 'Baixar Remarketing'}
          </Button>
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

      {/* Barra de Pesquisa e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <MonthFilter 
          selectedMonths={selectedMonths}
          onMonthsChange={setSelectedMonths}
        />
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
          <KanbanBoard searchTerm={searchTerm} selectedMonths={selectedMonths} />
        </CardContent>
      </Card>
    </div>
  );
}