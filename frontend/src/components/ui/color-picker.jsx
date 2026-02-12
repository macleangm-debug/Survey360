import * as React from "react"
import { Palette } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Default color presets
const DEFAULT_COLORS = [
  '#14b8a6', '#10b981', '#22c55e', '#84cc16',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#78716c', '#64748b'
]

/**
 * ColorPicker - A reusable color picker component
 * 
 * @param {string} value - The selected color (hex format)
 * @param {function} onChange - Callback when color changes
 * @param {string[]} presets - Array of preset colors (hex format)
 * @param {boolean} showPresets - Whether to show color presets
 * @param {boolean} showCustom - Whether to show custom color input
 * @param {boolean} showPreview - Whether to show color preview
 * @param {string} previewText - Text to show in preview
 * @param {string} className - Additional classes for the trigger button
 * @param {boolean} isDark - Dark mode styling
 * @param {boolean} disabled - Whether the picker is disabled
 */
export function ColorPicker({
  value = '#14b8a6',
  onChange,
  presets = DEFAULT_COLORS,
  showPresets = true,
  showCustom = true,
  showPreview = true,
  previewText = "Preview",
  className,
  isDark = true,
  disabled = false,
}) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handlePresetClick = (color) => {
    setInputValue(color)
    onChange?.(color)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    // Only call onChange if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange?.(val)
    }
  }

  const handleNativeColorChange = (e) => {
    const color = e.target.value
    setInputValue(color)
    onChange?.(color)
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
            className
          )}
        >
          <div 
            className="w-5 h-5 rounded mr-2 border border-white/20 shrink-0" 
            style={{ backgroundColor: value }}
          />
          <span className="font-mono uppercase">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-64",
          isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"
        )} 
        align="start"
      >
        <div className="space-y-4">
          {/* Color Presets */}
          {showPresets && presets.length > 0 && (
            <div className="space-y-2">
              <Label className={cn(
                "text-sm",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Select Color
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {presets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      value?.toLowerCase() === color.toLowerCase() 
                        ? "border-white ring-2 ring-white/30" 
                        : "border-transparent",
                      isDark ? "focus:ring-offset-gray-900" : "focus:ring-offset-white"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetClick(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Custom Color Input */}
          {showCustom && (
            <div className="space-y-2">
              <Label className={cn(
                "text-sm",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Custom Color
              </Label>
              <div className="flex gap-2">
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={value}
                    onChange={handleNativeColorChange}
                    className={cn(
                      "w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent",
                      "[&::-webkit-color-swatch-wrapper]:p-0",
                      "[&::-webkit-color-swatch]:rounded-lg",
                      "[&::-webkit-color-swatch]:border-2",
                      isDark 
                        ? "[&::-webkit-color-swatch]:border-white/20" 
                        : "[&::-webkit-color-swatch]:border-gray-300"
                    )}
                  />
                </div>
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className={cn(
                    "flex-1 font-mono uppercase",
                    isDark 
                      ? "bg-white/5 border-white/10 text-white" 
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          )}
          
          {/* Preview */}
          {showPreview && (
            <div className="space-y-2">
              <Label className={cn(
                "text-sm",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Preview
              </Label>
              <div 
                className="h-10 rounded-lg flex items-center justify-center text-white font-medium transition-colors"
                style={{ backgroundColor: value }}
              >
                {previewText}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * ColorSwatch - A simple color display/button
 */
export function ColorSwatch({
  color,
  selected = false,
  onClick,
  size = "md",
  className,
}) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  return (
    <button
      type="button"
      className={cn(
        "rounded-lg border-2 transition-all hover:scale-110 focus:outline-none",
        sizes[size],
        selected ? "border-white ring-2 ring-white/30" : "border-transparent",
        className
      )}
      style={{ backgroundColor: color }}
      onClick={() => onClick?.(color)}
      title={color}
    />
  )
}

/**
 * ColorInput - A simple color input with hex field
 */
export function ColorInput({
  value = '#14b8a6',
  onChange,
  className,
  isDark = true,
  disabled = false,
}) {
  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative shrink-0">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent",
            "[&::-webkit-color-swatch-wrapper]:p-0",
            "[&::-webkit-color-swatch]:rounded-lg",
            "[&::-webkit-color-swatch]:border-2",
            isDark 
              ? "[&::-webkit-color-swatch]:border-white/20" 
              : "[&::-webkit-color-swatch]:border-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          const val = e.target.value
          if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || val === '') {
            onChange?.(val || '#000000')
          }
        }}
        disabled={disabled}
        className={cn(
          "flex-1 font-mono uppercase",
          isDark 
            ? "bg-white/5 border-white/10 text-white" 
            : "bg-gray-50 border-gray-200 text-gray-900"
        )}
        placeholder="#000000"
        maxLength={7}
      />
    </div>
  )
}
