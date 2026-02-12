import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings2,
  Image,
  Calendar as CalendarIcon,
  Hash,
  MessageSquare,
  Upload,
  Palette,
  ToggleLeft,
  Clock,
  Link2,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Switch } from './switch';
import { Separator } from './separator';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * SurveySettingsSidebar - A reusable settings sidebar for survey configuration
 * 
 * @param {boolean} isOpen - Whether the sidebar is open
 * @param {function} onClose - Callback when sidebar closes
 * @param {object} settings - Current survey settings
 * @param {function} onSettingsChange - Callback when settings change
 * @param {boolean} isPublished - Whether the survey is published (shows share link)
 * @param {string} publicUrl - The public URL for sharing
 * @param {function} onLogoUpload - Callback for logo upload (receives file)
 * @param {function} onLogoRemove - Callback for logo removal
 * @param {boolean} uploading - Whether logo is currently uploading
 */
export function SurveySettingsSidebar({ 
  isOpen, 
  onClose, 
  settings = {},
  onSettingsChange,
  isPublished = false,
  publicUrl = '',
  onLogoUpload,
  onLogoRemove,
  uploading = false
}) {
  const [localSettings, setLocalSettings] = useState({
    name: '',
    description: '',
    close_date: null,
    close_time: '23:59',
    max_responses: '',
    thank_you_message: 'Thank you for completing our survey!',
    logo_url: null,
    brand_color: '#14b8a6',
    show_progress_bar: true,
    shuffle_questions: false,
    allow_multiple_submissions: false,
    require_login: false,
    ...settings
  });
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      const time = `${hour}:${minute}`;
      const label = format(new Date(2000, 0, 1, h, m), 'h:mm a');
      timeOptions.push({ value: time, label });
    }
  }

  // Sync local settings with props
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      ...settings
    }));
  }, [settings]);

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error('File too large. Maximum size is 500KB');
        return;
      }
      onLogoUpload?.(file);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse close_date to get Date object
  const closeDate = localSettings.close_date ? new Date(localSettings.close_date) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] bg-slate-900 border-l border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Survey Settings</h2>
                  <p className="text-xs text-slate-400">Configure your survey options</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-65px)] p-4 space-y-6">
              {/* Survey Name */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Survey Name</Label>
                <Input
                  value={localSettings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="My Survey"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Description</Label>
                <Textarea
                  value={localSettings.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add a description for your survey..."
                  className="bg-slate-800 border-slate-600 text-white min-h-[100px] resize-none"
                />
              </div>

              <Separator className="bg-slate-700" />

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Logo
                </Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                  {localSettings.logo_url ? (
                    <div className="relative">
                      <img 
                        src={localSettings.logo_url} 
                        alt="Survey logo" 
                        className="max-h-24 mx-auto rounded"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        onClick={onLogoRemove}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-400">
                        {uploading ? 'Uploading...' : 'Click to upload logo'}
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 500KB</p>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Close Date with Calendar Picker */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Close Date (Optional)
                </Label>
                
                {/* Date Picker */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-800 border-slate-600 hover:bg-slate-700",
                        !closeDate && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {closeDate ? (
                        format(closeDate, "PPP")
                      ) : (
                        <span>Pick a close date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
                    <Calendar
                      mode="single"
                      selected={closeDate}
                      onSelect={(date) => {
                        handleChange('close_date', date ? date.toISOString() : null);
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="rounded-md"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium text-white",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-white border border-slate-600 rounded-md",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-slate-400 rounded-md w-8 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-teal-500 rounded-md",
                        day: "h-8 w-8 p-0 font-normal text-white hover:bg-slate-700 rounded-md aria-selected:opacity-100",
                        day_selected: "bg-teal-500 text-white hover:bg-teal-600 focus:bg-teal-500",
                        day_today: "bg-slate-700 text-white",
                        day_outside: "text-slate-500 opacity-50",
                        day_disabled: "text-slate-600 opacity-50",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Picker - Shows only when date is selected */}
                {closeDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <Select
                      value={localSettings.close_time || '23:59'}
                      onValueChange={(value) => handleChange('close_time', value)}
                    >
                      <SelectTrigger className="flex-1 bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 max-h-[200px]">
                        {timeOptions.map((time) => (
                          <SelectItem 
                            key={time.value} 
                            value={time.value}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
                          >
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Clear Date Button */}
                {closeDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() => {
                      handleChange('close_date', null);
                      handleChange('close_time', '23:59');
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear date
                  </Button>
                )}

                <p className="text-xs text-slate-400">
                  Survey will automatically stop accepting responses after this date and time
                </p>
              </div>

              {/* Max Responses */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Max Responses (Optional)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={localSettings.max_responses || ''}
                  onChange={(e) => handleChange('max_responses', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Unlimited"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400">
                  Survey will close after reaching this number of responses
                </p>
              </div>

              <Separator className="bg-slate-700" />

              {/* Thank You Message */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Thank You Message
                </Label>
                <Textarea
                  value={localSettings.thank_you_message || ''}
                  onChange={(e) => handleChange('thank_you_message', e.target.value)}
                  placeholder="Thank you for completing our survey!"
                  className="bg-slate-800 border-slate-600 text-white min-h-[80px] resize-none"
                />
                <p className="text-xs text-slate-400">
                  Shown to respondents after submitting
                </p>
              </div>

              {/* Primary Color with Live Preview */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Brand Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localSettings.brand_color || '#14b8a6'}
                    onChange={(e) => handleChange('brand_color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-slate-600"
                  />
                  <Input
                    value={localSettings.brand_color || '#14b8a6'}
                    onChange={(e) => handleChange('brand_color', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white font-mono flex-1 uppercase"
                  />
                </div>
                
                {/* Color Preview */}
                <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-600">
                  <p className="text-xs text-slate-400 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <button 
                      className="px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
                      style={{ backgroundColor: localSettings.brand_color || '#14b8a6' }}
                    >
                      Submit Survey
                    </button>
                    <div 
                      className="h-2 flex-1 rounded-full"
                      style={{ backgroundColor: localSettings.brand_color || '#14b8a6' }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Accent color for the public survey form
                </p>
              </div>

              <Separator className="bg-slate-700" />

              {/* Toggle Options */}
              <div className="space-y-4">
                <Label className="text-white font-medium flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4" />
                  Options
                </Label>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Show Progress Bar</p>
                    <p className="text-xs text-slate-400">Display progress at the top</p>
                  </div>
                  <Switch
                    checked={localSettings.show_progress_bar ?? true}
                    onCheckedChange={(checked) => handleChange('show_progress_bar', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Shuffle Questions</p>
                    <p className="text-xs text-slate-400">Randomize question order</p>
                  </div>
                  <Switch
                    checked={localSettings.shuffle_questions ?? false}
                    onCheckedChange={(checked) => handleChange('shuffle_questions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Allow Multiple Submissions</p>
                    <p className="text-xs text-slate-400">Same user can submit again</p>
                  </div>
                  <Switch
                    checked={localSettings.allow_multiple_submissions ?? false}
                    onCheckedChange={(checked) => handleChange('allow_multiple_submissions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Require Login</p>
                    <p className="text-xs text-slate-400">Respondents must sign in</p>
                  </div>
                  <Switch
                    checked={localSettings.require_login ?? false}
                    onCheckedChange={(checked) => handleChange('require_login', checked)}
                  />
                </div>
              </div>

              {/* Public Link (shown when published) */}
              {isPublished && publicUrl && (
                <>
                  <Separator className="bg-slate-700" />
                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Public Survey Link
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={publicUrl}
                        readOnly
                        className="bg-slate-800 border-slate-600 text-white text-sm flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyLink}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Share this link with respondents
                    </p>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="pt-4 pb-8">
                <Button 
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white" 
                  onClick={onClose}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SurveySettingsSidebar;
