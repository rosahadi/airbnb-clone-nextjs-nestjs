"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type CalendarProps = {
  className?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
};

export function Calendar({
  className,
  selected,
  onChange,
}: CalendarProps) {
  return (
    <div className={cn("relative", className)}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        inline
        calendarClassName="bg-white rounded-md shadow p-2"
        dayClassName={(date) =>
          cn(
            buttonVariants({ variant: "ghost" }),
            "w-8 h-8 p-0 text-sm rounded-full hover:bg-accent",
            selected?.toDateString() ===
              date.toDateString() && "bg-primary text-white"
          )
        }
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex justify-between items-center mb-2 px-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="p-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">
              {date.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="p-1"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
