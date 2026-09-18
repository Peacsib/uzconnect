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
      className={cn("p-2.5 bg-white select-none rounded-xl w-[244px] shadow-lg border border-gray-100", className)}
      formatters={{
        formatWeekdayName: (date) => ["S", "M", "T", "W", "T", "F", "S"][date.getDay()],
      }}
      classNames={{
        root: cn(defaultClassNames.root, "rdp-root relative w-full"),
        months: cn(defaultClassNames.months, "relative w-full"),
        month: cn(defaultClassNames.month, "space-y-2 w-full"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "flex items-center justify-center relative h-7 px-7 mb-1"
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "text-[13px] font-semibold text-gray-800 tracking-tight"
        ),
        nav: cn(
          defaultClassNames.nav,
          "absolute inset-0 flex items-center justify-between pointer-events-none"
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          "pointer-events-auto h-6 w-6 rounded-full hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors"
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "pointer-events-auto h-6 w-6 rounded-full hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors"
        ),
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse table-fixed"),
        weekdays: cn(defaultClassNames.weekdays, "border-b border-gray-100/80 mb-1"),
        weekday: cn(
          defaultClassNames.weekday,
          "w-[32px] h-6 text-center text-[10px] font-semibold text-gray-400 uppercase p-0"
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn(defaultClassNames.week, "h-7"),
        day: cn(defaultClassNames.day, "w-[32px] h-7 p-0 text-center relative"),
        day_button: cn(
          defaultClassNames.day_button,
          "w-6 h-6 mx-auto rounded-full text-[11.5px] font-normal text-gray-700 transition-all flex items-center justify-center hover:bg-blue-50 hover:text-[#003366]"
        ),
        selected: cn(defaultClassNames.selected, "rdp-selected"),
        today: cn(defaultClassNames.today, "rdp-today"),
        outside: cn(defaultClassNames.outside, "rdp-outside"),
        disabled: cn(defaultClassNames.disabled, "rdp-disabled"),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...cProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-3.5 w-3.5 text-gray-600", chevronClass)} {...cProps} />;
          }
          return <ChevronRight className={cn("h-3.5 w-3.5 text-gray-600", chevronClass)} {...cProps} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
