"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addWeeks,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";

interface DatePickerToggleProps {
  id?: string;
  name?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  minDate?: Date;
  maxDate?: Date;
  defaultOpen?: boolean;
}

export const useDatePickerToggle = (initialValue: Date | null = null) => {
  const [date, setDate] = useState<Date | null>(initialValue);

  const handleDateChange = useCallback((val: Date | null) => {
    setDate(val);
  }, []);

  const resetDate = useCallback(() => {
    setDate(null);
  }, []);

  return {
    date,
    setDate,
    handleDateChange,
    resetDate,
  };
};

export const DatePickerToggle: React.FC<DatePickerToggleProps> = ({
  id = "date",
  name = "date",
  value,
  onChange,
  disabled = false,
  className = "",
  label,
  error = false,
  minDate,
  maxDate,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // Estado substituído - armazena o domingo da semana sendo exibida
  const [currentStartOfWeek, setCurrentStartOfWeek] = useState<Date>(() => {
    const baseDate = value || new Date();
    return startOfWeek(baseDate, { weekStartsOn: 0 });
  });

  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const isDateDisabled = (date: Date) => {
    const normalizedDay = normalizeDate(date);
    const today = normalizeDate(new Date());

    const min = minDate ? normalizeDate(minDate) : new Date("1900-01-01");
    const max = maxDate ? normalizeDate(maxDate) : today;

    return normalizedDay > max || normalizedDay < min;
  };

  // Sincroniza quando o valor externo muda
  useEffect(() => {
    if (value) {
      const dateValue = typeof value === "string" ? parseISO(value) : value;
      setCurrentStartOfWeek(startOfWeek(dateValue, { weekStartsOn: 0 }));
    }
  }, [value]);

  const handleCalendarChange = (selected: Date | undefined) => {
    if (!selected) return;
    onChange(selected);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getCurrentWeekDays = () => {
    const end = endOfWeek(currentStartOfWeek, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: currentStartOfWeek, end });
  };

  const weekDays = getCurrentWeekDays();

  const handleWeekDayClick = (day: Date) => {
    if (disabled || isDateDisabled(day)) return;
    onChange(day);
  };

  const goToPreviousWeek = () => {
    setCurrentStartOfWeek((prev) => addWeeks(prev, -1));
  };

  const goToNextWeek = () => {
    setCurrentStartOfWeek((prev) => addWeeks(prev, 1));
  };

  const diasAbreviados = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <div
          className={cn(
            "relative w-full rounded-md border bg-background transition-all duration-200",
            error
              ? "border-red-500 ring-red-300"
              : "border-gray-300 focus-within:ring-2 focus-within:ring-gray-300",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          {/* Header com label e toggle */}
          <div
            className={cn(
              "flex cursor-pointer items-center justify-between p-3",
              disabled && "cursor-not-allowed",
            )}
            onClick={handleToggle}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div className="relative flex flex-col">
                {label && (
                  <label
                    htmlFor={id}
                    className={cn(
                      "absolute -top-5 text-nowrap bg-white px-1 text-xs font-medium dark:bg-background",
                      error ? "text-red-500" : "text-gray-500",
                    )}
                  >
                    {label}
                  </label>
                )}
                {value && (
                  <span className="text-sm text-gray-900 dark:text-gray-500">
                    {format(value, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>

            {!disabled && (
              <div className="text-gray-400">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            )}
          </div>

          {/* Conteúdo - Semana ou Mês */}
          <div className="border-t border-gray-200">
            {!isOpen ? (
              /* Visualização da semana atual */
              <div className="p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-500">
                    Semana de {format(weekDays[0], "dd/MM")} a{" "}
                    {format(weekDays[6], "dd/MM")}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPreviousWeek();
                      }}
                      className="h-6 w-6"
                      disabled={disabled}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNextWeek();
                      }}
                      className="h-6 w-6"
                      disabled={disabled}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const isSelected = value && isSameDay(day, value);
                    const isTodayDay = isToday(day);
                    const isDisabled = isDateDisabled(day) || disabled;

                    return (
                      <Button
                        type="button"
                        variant={"outline"}
                        key={day.toISOString()}
                        onClick={() => handleWeekDayClick(day)}
                        disabled={isDisabled}
                        className={cn(
                          "flex flex-col items-center rounded-md p-2 py-2 text-xs transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            : isTodayDay
                              ? "bg-accent font-medium text-gray-900"
                              : "text-gray-600 hover:bg-accent hover:text-accent-foreground",
                          isDisabled &&
                            "cursor-not-allowed opacity-50 hover:bg-transparent",
                          !disabled && !isDisabled && "cursor-pointer",
                        )}
                      >
                        <span className="font-semibold capitalize">
                          {diasAbreviados[day.getDay()]}
                        </span>
                        <span className="font-medium">{format(day, "d")}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Visualização do mês completo */
              <div className="w-full p-3">
                <Calendar
                  mode="single"
                  selected={value ?? undefined}
                  onSelect={handleCalendarChange}
                  locale={ptBR}
                  captionLayout="dropdown"
                  disabled={(date) => isDateDisabled(date) || disabled}
                  styles={{
                    head_cell: {
                      width: "100%",
                      textTransform: "capitalize",
                    },
                    cell: {
                      width: "100%",
                    },
                    button: {
                      width: "100%",
                    },
                    nav_button_previous: {
                      width: "32px",
                      height: "32px",
                    },
                    nav_button_next: {
                      width: "32px",
                      height: "32px",
                    },
                    caption: {
                      textTransform: "capitalize",
                    },
                  }}
                  classNames={{ months: "sm:flex-col" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
