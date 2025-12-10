"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  includeTime?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "選擇日期",
  required = false,
  error = false,
  disabled = false,
  includeTime = true,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [time, setTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : "00:00"
  );
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // 創建本地時間的日期，避免時區轉換問題
      const localDate = new Date(selectedDate);
      const [hours, minutes] = time.split(":");
      localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setDate(localDate);
      onChange?.(localDate);
    } else {
      setDate(undefined);
      onChange?.(null);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (date) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setDate(newDate);
      onChange?.(newDate);
    }
  };

  const handleClear = () => {
    setDate(undefined);
    setTime("00:00");
    onChange?.(null);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500 animate-shake"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              includeTime ? (
                format(date, "PPP HH:mm")
              ) : (
                format(date, "PPP")
              )
            ) : (
              <span>{placeholder}</span>
            )}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          {includeTime && (
            <div className="border-t p-3 space-y-2">
              <Label htmlFor="time-picker" className="text-sm font-medium">
                時間 (選填)
              </Label>
              <Input
                id="time-picker"
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          )}
          <div className="border-t p-3 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!date}
            >
              清除
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              確定
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {error && required && !date && (
        <p className="text-sm text-red-500 animate-fade-in">此欄位為必填</p>
      )}
    </div>
  );
}
