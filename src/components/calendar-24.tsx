"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Calendar24Props {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export default function Calendar24({ date, setDate }: Calendar24Props) {
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined);
      return;
    }
    const currentTime = date ? date.toTimeString().split(" ")[0] : "00:00:00";
    const [hours, minutes, seconds] = currentTime.split(":").map(Number);
    newDate.setHours(hours, minutes, seconds);
    setDate(newDate);
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!date) {
      // If no date is set, create a new date with the selected time
      const newDate = new Date();
      const [hours, minutes, seconds] = newTime.split(":").map(Number);
      newDate.setHours(hours, minutes, seconds);
      setDate(newDate);
      return;
    }
    const newDate = new Date(date);
    const [hours, minutes, seconds] = newTime.split(":").map(Number);
    newDate.setHours(hours, minutes, seconds);
    setDate(newDate);
  };

  const timeValue = date ? date.toTimeString().split(" ")[0] : "00:00:00";

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={timeValue}
          onChange={handleTimeChange}
          className="bg-background"
        />
      </div>
    </div>
  );
}
