"use client";

import Calendar24 from "@/components/calendar-24";

export function DatePicker({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}) {
  return <Calendar24 date={date} setDate={setDate} />;
}
