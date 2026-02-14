import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * DatePicker - A reusable date picker component
 * 
 * @param {Date} value - The selected date
 * @param {function} onChange - Callback when date changes (receives Date or null)
 * @param {string} placeholder - Placeholder text when no date selected
 * @param {boolean} disabled - Whether the picker is disabled
 * @param {Date} minDate - Minimum selectable date
 * @param {Date} maxDate - Maximum selectable date
 * @param {boolean} clearable - Show clear button when date is selected
 * @param {string} className - Additional classes for the trigger button
 * @param {boolean} isDark - Dark mode styling
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
  clearable = true,
  className,
  isDark = true,
}) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date) => {
    onChange?.(date || null)
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.(null)
  }

  const disabledDays = (date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            isDark 
              ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
              : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
            !value && (isDark ? "text-gray-500" : "text-gray-400"),
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            <span className="flex-1">
              {format(value, "MMMM d, yyyy")}
            </span>
          ) : (
            <span className="flex-1">{placeholder}</span>
          )}
          {clearable && value && (
            <X 
              className="h-4 w-4 opacity-50 hover:opacity-100" 
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0",
          isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"
        )} 
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabledDays}
          initialFocus
          className={isDark ? "text-white" : ""}
        />
        {clearable && value && (
          <div className={cn(
            "p-3 border-t",
            isDark ? "border-white/10" : "border-gray-200"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(null)
                setOpen(false)
              }}
              className={cn(
                "w-full",
                isDark 
                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
              )}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/**
 * DateTimePicker - A date picker with time selection
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date and time",
  disabled = false,
  minDate,
  clearable = true,
  className,
  isDark = true,
}) {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState(
    value ? format(value, "HH:mm") : "12:00"
  )

  const handleDateSelect = (date) => {
    if (date) {
      const [hours, minutes] = time.split(":").map(Number)
      date.setHours(hours, minutes)
      onChange?.(date)
    }
  }

  const handleTimeChange = (e) => {
    setTime(e.target.value)
    if (value) {
      const [hours, minutes] = e.target.value.split(":").map(Number)
      const newDate = new Date(value)
      newDate.setHours(hours, minutes)
      onChange?.(newDate)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            isDark 
              ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
              : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
            !value && (isDark ? "text-gray-500" : "text-gray-400"),
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "MMMM d, yyyy 'at' h:mm a")
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0",
          isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"
        )} 
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={(date) => minDate && date < minDate}
          initialFocus
          className={isDark ? "text-white" : ""}
        />
        <div className={cn(
          "p-3 border-t flex items-center gap-2",
          isDark ? "border-white/10" : "border-gray-200"
        )}>
          <span className={cn(
            "text-sm",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>Time:</span>
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className={cn(
              "flex-1 px-2 py-1 rounded text-sm",
              isDark 
                ? "bg-white/5 border-white/10 text-white" 
                : "bg-gray-50 border-gray-200 text-gray-900"
            )}
          />
        </div>
        {clearable && value && (
          <div className={cn(
            "p-3 border-t",
            isDark ? "border-white/10" : "border-gray-200"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(null)
                setOpen(false)
              }}
              className={cn(
                "w-full",
                isDark 
                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
              )}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
