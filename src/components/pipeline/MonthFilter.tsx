import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MonthFilterProps {
  selectedMonths: string[];
  onMonthsChange: (months: string[]) => void;
}

export function MonthFilter({ selectedMonths, onMonthsChange }: MonthFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const toggleMonth = (year: number, monthIndex: number) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    if (selectedMonths.includes(monthKey)) {
      onMonthsChange(selectedMonths.filter(m => m !== monthKey));
    } else {
      onMonthsChange([...selectedMonths, monthKey]);
    }
  };

  const clearFilters = () => {
    onMonthsChange([]);
    setIsOpen(false);
  };

  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Filtrar por Mês
            {selectedMonths.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedMonths.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Selecione os Meses</h3>
              {selectedMonths.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {years.map(year => (
                <div key={year} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{year}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => {
                      const monthKey = `${year}-${String(index + 1).padStart(2, '0')}`;
                      const isSelected = selectedMonths.includes(monthKey);
                      
                      return (
                        <Button
                          key={monthKey}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleMonth(year, index)}
                          className="w-full text-xs"
                        >
                          {month.slice(0, 3)}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedMonths.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMonths.map(monthKey => (
            <Badge key={monthKey} variant="secondary" className="gap-1">
              {formatMonthDisplay(monthKey)}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onMonthsChange(selectedMonths.filter(m => m !== monthKey))}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
