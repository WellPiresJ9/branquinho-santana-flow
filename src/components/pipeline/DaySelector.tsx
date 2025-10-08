import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

interface DaySelectorProps {
  onSelectDay: (day: number) => void;
  selectedDay?: number;
}

export function DaySelector({ onSelectDay, selectedDay }: DaySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleDayClick = (day: number) => {
    onSelectDay(day);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <CalendarDays className="w-3 h-3" />
          {selectedDay ? `Dia ${selectedDay} selecionado` : 'Selecionar por Dia'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Selecionar leads do dia:</h4>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                size="sm"
                onClick={() => handleDayClick(day)}
                className="h-8 w-8 p-0 text-xs"
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
