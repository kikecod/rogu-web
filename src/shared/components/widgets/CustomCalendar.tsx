import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  // [MEJORA] límites opcionales (incluyentes)
  minDate?: Date; // por defecto: hoy
  maxDate?: Date;
  // [MEJORA] inicio de semana: 0=domingo, 1=lunes
  weekStartsOn?: 0 | 1;
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  weekStartsOn = 1, // [MEJORA] lunes por defecto (estándar ES)
}) => {
  // [MEJORA] normalizamos mes actual al día 1 para evitar offsets raros
  const initialMonth = useMemo(
    () => startOfMonth(selectedDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);

  // [MEJORA] si cambian desde fuera el selectedDate a otro mes, sincronizamos la vista
  useEffect(() => {
    const sd = startOfMonth(selectedDate);
    if (
      sd.getFullYear() !== currentMonth.getFullYear() ||
      sd.getMonth() !== currentMonth.getMonth()
    ) {
      setCurrentMonth(sd);
    }
  }, [selectedDate, currentMonth]);

  // [MEJORA] límites por defecto: min=hoy si no enviaron minDate
  const today = startOfDay(new Date());
  const min = startOfDay(minDate ?? today);
  const max = maxDate ? startOfDay(maxDate) : undefined;

  // [MEJORA] nombres de mes (abreviados)
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // [MEJORA] nombres de días, rotados según inicio de semana y con 'X' para miércoles
  const baseDays = ['D','L','M','X','J','V','S'];
  const dayNames = useMemo(() => {
    if (weekStartsOn === 0) return baseDays;
    // mover 'D' al final si empieza lunes
    return [...baseDays.slice(1), baseDays[0]];
  }, [weekStartsOn]);

  const getMonthInfo = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const daysInMonth = lastDay.getDate();

    // [MEJORA] ajustar índice de arranque por weekStartsOn
    const raw = firstDay.getDay(); // 0=Dom ... 6=Sáb
    const startingIndex = (raw - weekStartsOn + 7) % 7;

    return { daysInMonth, startingIndex };
  };

  const { daysInMonth, startingIndex } = getMonthInfo(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const isDisabled = (d: Date) => {
    const sd = startOfDay(d);
    if (sd < min) return true;
    if (max && sd > max) return true;
    return false;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDisabled(newDate)) onDateSelect(newDate);
  };

  const isToday = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isSameDay(d, today);
  };

  const isSelected = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isSameDay(d, selectedDate);
  };

  const renderDays = () => {
    const days: React.ReactNode[] = [];

    // celdas vacías antes del primer día del mes
    for (let i = 0; i < startingIndex; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" aria-hidden="true" />);
    }

    // días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDisabled(date);
      const todayClass = isToday(day);
      const selectedClass = isSelected(day);

      days.push(
        <button
          key={day}
          onClick={() => !disabled && handleDateClick(day)}
          disabled={disabled}
          aria-label={date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          aria-selected={selectedClass}
          className={`
            aspect-square p-1 rounded-lg text-xs font-medium transition-all
            ${selectedClass 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md scale-110' 
              : todayClass
              ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-400 font-bold'
              : disabled
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-blue-50 hover:scale-110'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-3 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4 text-blue-600" />
        </button>

        <h3 className="text-sm font-bold text-gray-900" aria-live="polite">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4 text-blue-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 p-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
};

export default CustomCalendar;
