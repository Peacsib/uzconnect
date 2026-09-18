import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white select-none rounded-xl", className)}
      classNames={{
        root: cn(defaultClassNames.root, "rdp-root relative"),
        months: cn(defaultClassNames.months, "relative"),
        month: cn(defaultClassNames.month, "space-y-3"),
        month_caption: cn(defaultClassNames.month_caption, "flex items-center justify-center relative h-9 px-8"),
        caption_label: cn(defaultClassNames.caption_label, "text-sm font-bold text-gray-900 tracking-tight"),
        nav: cn(defaultClassNames.nav, "absolute inset-0 flex items-center justify-between pointer-events-none"),
        button_previous: cn(
          defaultClassNames.button_previous,
          "pointer-events-auto h-7 w-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors shadow-xs"
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "pointer-events-auto h-7 w-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors shadow-xs"
        ),
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse"),
        weekdays: cn(defaultClassNames.weekdays, "border-b border-gray-100"),
        weekday: cn(defaultClassNames.weekday, "w-9 h-8 text-center text-[11px] font-semibold text-gray-500 uppercase p-0"),
        weeks: cn(defaultClassNames.weeks),
        week: cn(defaultClassNames.week),
        day: cn(defaultClassNames.day, "w-9 h-9 p-0 text-center text-sm relative"),
        day_button: cn(
          defaultClassNames.day_button,
          "w-8 h-8 mx-auto rounded-lg text-xs font-medium text-gray-800 transition-all flex items-center justify-center hover:bg-[#003366]/10 hover:text-[#003366] hover:font-bold"
        ),
        selected: cn(
          defaultClassNames.selected,
          "rdp-selected"
        ),
        today: cn(
          defaultClassNames.today,
          "rdp-today"
        ),
        outside: cn(
          defaultClassNames.outside,
          "rdp-outside"
        ),
        disabled: cn(
          defaultClassNames.disabled,
          "rdp-disabled"
        ),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...cProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4 text-gray-700", chevronClass)} {...cProps} />;
          }
          return <ChevronRight className={cn("h-4 w-4 text-gray-700", chevronClass)} {...cProps} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
