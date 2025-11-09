import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "./ui/button";

interface SimpleCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

export function SimpleCalendar({ selected, onSelect, disabled }: SimpleCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];
  
  const dayNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    if (disabled && disabled(date)) return;
    onSelect(date);
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth &&
      selected.getFullYear() === currentYear
    );
  };

  const isDisabled = (day: number) => {
    if (!disabled) return false;
    const date = new Date(currentYear, currentMonth, day);
    return disabled(date);
  };

  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const selected = isSelected(day);
    const disabled = isDisabled(day);
    
    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        disabled={disabled}
        className={`
          h-9 w-9 rounded-md text-sm
          ${selected 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'hover:bg-gray-100'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed text-gray-400' 
            : 'cursor-pointer'
          }
          transition-colors
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="p-3 border rounded-md bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={previousMonth}
        >
          <FiChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-medium text-sm">
          {monthNames[currentMonth]} {currentYear}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={nextMonth}
        >
          <FiChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name) => (
          <div
            key={name}
            className="h-9 w-9 flex items-center justify-center text-xs text-gray-500 font-normal"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}
