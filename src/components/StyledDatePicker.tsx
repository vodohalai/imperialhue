import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/i18n/LanguageContext";

type StyledDatePickerProps = {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  className?: string;
};

const StyledDatePicker = ({ value, onChange, min, className = "" }: StyledDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  const dateLocale = lang === "vi" ? vi : enUS;
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;
  const minDate = min ? new Date(min + "T00:00:00") : undefined;

  const displayValue = selectedDate
    ? format(selectedDate, "dd MMM yyyy", { locale: dateLocale })
    : "";

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const iso = format(date, "yyyy-MM-dd");
      onChange(iso);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex w-full items-center justify-between gap-2 text-sm font-semibold text-slate-700 outline-none ${className}`}
        >
          <span className="truncate">{displayValue}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-[#0D9488]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto rounded-2xl border-[#ece6dd] bg-white p-0 shadow-xl shadow-slate-200/60"
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={minDate ? { before: minDate } : undefined}
          locale={dateLocale}
          className="rounded-2xl"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            month_caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-bold text-slate-800",
            nav: "space-x-1 flex items-center",
            button_previous:
              "absolute left-1 h-8 w-8 bg-transparent p-0 text-slate-500 hover:text-[#0D9488] hover:bg-[#0D9488]/10 rounded-xl inline-flex items-center justify-center transition-colors border border-transparent hover:border-[#ece6dd]",
            button_next:
              "absolute right-1 h-8 w-8 bg-transparent p-0 text-slate-500 hover:text-[#0D9488] hover:bg-[#0D9488]/10 rounded-xl inline-flex items-center justify-center transition-colors border border-transparent hover:border-[#ece6dd]",
            month_grid: "w-full border-collapse space-y-1",
            weekdays: "flex",
            weekday: "text-[#0D9488] rounded-xl w-9 font-semibold text-[0.75rem] uppercase",
            week: "flex w-full mt-1",
            day: "h-9 w-9 text-center text-sm p-0 relative rounded-xl focus-within:relative focus-within:z-20",
            day_button:
              "h-9 w-9 p-0 font-medium rounded-xl transition-colors hover:bg-[#0D9488]/10 hover:text-[#0D9488] aria-selected:opacity-100 inline-flex items-center justify-center",
            selected:
              "bg-[#0D9488] text-white hover:bg-[#0D9488] hover:text-white focus:bg-[#0D9488] focus:text-white rounded-xl",
            today:
              "bg-[#f97316]/10 text-[#f97316] font-bold",
            outside: "text-slate-300 opacity-50",
            disabled: "text-slate-300 opacity-40",
            hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default StyledDatePicker;