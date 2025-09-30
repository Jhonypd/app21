"use client";

import React, { useState, useRef, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { TimeSelectInput } from "./input-select-time";

type PickerMode = "single" | "range";

interface BaseProps {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label: string;
  date?: Date;
  time?: string;
  onDateChange?: (date: Date | undefined) => void;
  onTimeChange?: (time: string | undefined) => void;
  error?: boolean;
  minDate?: Date;
  maxDate?: Date;
  mode?: PickerMode;
  withTime?: boolean;
  timeStep?: number;
  timeRange?: { start: string; end: string };
}

interface SingleProps extends BaseProps {
  mode?: "single";
  dateValue: Date | null;
  timeValue?: string;
  onDateChange?: (date: Date | null) => void;
  onTimeChange?: (time: string) => void;
}

interface RangeProps extends BaseProps {
  mode: "range";
  dateValue?: DateRange;
  onDateChange?: (value: DateRange | undefined) => void;
}

type DatePickerInputProps = SingleProps | RangeProps;

function isSingleProps(props: DatePickerInputProps): props is SingleProps {
  return props.mode === "single" || !props.mode;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = (props) => {
  const {
    id = "date",
    name = "date",
    placeholder = "dd/MM/yyyy",
    dateValue,
    disabled = false,
    className = "",
    label,
    error = false,
    minDate,
    maxDate,
    mode = "single",
    withTime = false,
    timeStep = 10,
    timeRange = { start: "00:00", end: "23:59" },
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedTime, setSelectedTime] = useState(
    isSingleProps(props) && props.timeValue ? props.timeValue : "00:00",
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const shouldLabelBeOnTop = isFocused || inputValue.length > 0;

  useEffect(() => {
    if (mode === "single") {
      const singleValue = dateValue as Date | null;
      if (singleValue && isValid(singleValue)) {
        let formattedValue = format(singleValue, "dd/MM/yyyy");
        if (withTime && selectedTime) {
          formattedValue += ` ${selectedTime}`;
        }
        setInputValue(formattedValue);
      } else {
        setInputValue("");
      }
    } else {
      const rangeValue = dateValue as DateRange | undefined;
      const from = rangeValue?.from;
      const to = rangeValue?.to;

      if (from && isValid(from)) {
        const formattedFrom = format(from, "dd/MM/yyyy");
        const formattedTo = to && isValid(to) ? format(to, "dd/MM/yyyy") : "";
        setInputValue(
          formattedTo ? `${formattedFrom} - ${formattedTo}` : formattedFrom,
        );
      } else {
        setInputValue("");
      }
    }
  }, [dateValue, mode, withTime, selectedTime]);

  useEffect(() => {
    if (
      isSingleProps(props) &&
      props.timeValue &&
      props.timeValue !== selectedTime
    ) {
      setSelectedTime(props.timeValue);
    }
  }, [props, selectedTime]);

  const handleDateChangeSingle = (selected: Date | undefined) => {
    if (isSingleProps(props)) {
      const cleanDate = selected ? new Date(selected) : null;
      if (cleanDate) cleanDate.setHours(0, 0, 0, 0);
      props.onDateChange?.(cleanDate);
    }
  };

  const handleDateChangeRange = (range: DateRange | undefined) => {
    if (!isSingleProps(props)) {
      props.onDateChange?.(range);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (isSingleProps(props)) {
      props.onTimeChange?.(time);
    }
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Popover
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsOpen(false);
              setIsFocused(false);
            }
          }}
        >
          <PopoverTrigger asChild>
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                id={id}
                name={name}
                placeholder={shouldLabelBeOnTop ? placeholder : ""}
                value={inputValue}
                disabled={disabled}
                readOnly
                onFocus={() => {
                  setIsFocused(true);
                  setIsOpen(true);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                  setIsFocused(true);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "peer max-h-[46px] w-full cursor-pointer rounded-md bg-background py-3 pl-11 pr-4 transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2",
                  error
                    ? "border-red-500 ring-red-300"
                    : "border border-gray-300 focus-visible:ring-gray-300",
                  disabled && "cursor-not-allowed opacity-50",
                  className,
                )}
              />

              <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>

              {label && (
                <label
                  htmlFor={id}
                  className={cn(
                    "pointer-events-none absolute left-10 transition-all duration-200",
                    shouldLabelBeOnTop
                      ? "-top-2 z-10 bg-background px-1 text-xs text-gray-500"
                      : "top-1/2 -translate-y-1/2 text-sm text-gray-600",
                    error && "text-red-500",
                  )}
                >
                  {label}
                </label>
              )}
            </div>
          </PopoverTrigger>

          <PopoverContent className="!w-auto p-0" align="center">
            {mode === "single" ? (
              <Calendar
                mode="single"
                selected={dateValue as Date}
                onSelect={handleDateChangeSingle}
                locale={ptBR}
                captionLayout="dropdown"
                numberOfMonths={1}
                disabled={(date) => {
                  const today = new Date();
                  const min = minDate || new Date("1900-01-01");
                  const max = maxDate || today;
                  return date > max || date < min;
                }}
              />
            ) : (
              <Calendar
                mode="range"
                selected={dateValue as DateRange}
                onSelect={handleDateChangeRange}
                locale={ptBR}
                captionLayout="dropdown"
                numberOfMonths={2}
                disabled={(date) => {
                  const today = new Date();
                  const min = minDate || new Date("1900-01-01");
                  const max = maxDate || today;
                  return date > max || date < min;
                }}
              />
            )}

            {mode === "single" && withTime && (
              <div className="p-4">
                <TimeSelectInput
                  label="Horário"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  step={timeStep}
                  format="hh:mm"
                  startTime={timeRange.start}
                  endTime={timeRange.end}
                />
              </div>
            )}

            <div className="mb-2 flex w-full items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirm}
                className="cursor-pointer border-primary uppercase text-primary hover:bg-primary/10 hover:text-primary"
              >
                Confirmar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
