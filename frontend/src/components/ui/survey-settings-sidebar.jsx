import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings2,
  Image,
  Calendar,
  Hash,
  MessageSquare,
  Upload,
  Palette,
  ToggleLeft,
  Link2,
  Copy,
  Check
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Switch } from './switch';
import { Separator } from './separator';
import { DatePicker } from './date-picker';
import { ColorPicker } from './color-picker';
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
 * @param {boolean} isDark - Dark mode styling (default: true)
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
  uploading = false,
  isDark = true
}) {
  const [localSettings, setLocalSettings] = useState({
    name: '',
    description: '',
    close_date: null,
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
  
  const [copied, setCopied] = useState(false);

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

  const bgPrimary = isDark ? 'bg-slate-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-slate-800' : 'bg-gray-50';
  const borderColor = isDark ? 'border-slate-700' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputBg = isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900';

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
            className={`fixed right-0 top-0 h-full w-[400px] ${bgPrimary} border-l ${borderColor} z-50 overflow-hidden`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h2 className={`font-semibold ${textPrimary}`}>Survey Settings</h2>
                  <p className={`text-xs ${textSecondary}`}>Configure your survey options</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className={isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-65px)] p-4 space-y-6">
              {/* Survey Name */}
              <div className="space-y-2">
                <Label className={`${textPrimary} font-medium`}>Survey Name</Label>
                <Input
                  value={localSettings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="My Survey"
                  className={inputBg}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className={`${textPrimary} font-medium`}>Description</Label>
                <Textarea
                  value={localSettings.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add a description for your survey..."
                  className={`${inputBg} min-h-[100px] resize-none`}
                />
              </div>

              <Separator className={isDark ? 'bg-slate-700' : 'bg-gray-200'} />

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className={`${textPrimary} font-medium flex items-center gap-2`}>
                  <Image className="w-4 h-4" />
                  Logo
                </Label>
                <div className={`border-2 border-dashed ${isDark ? 'border-slate-600' : 'border-gray-300'} rounded-lg p-4 text-center`}>
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
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${textSecondary}`} />
                      <p className={`text-sm ${textSecondary}`}>
                        {uploading ? 'Uploading...' : 'Click to upload logo'}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        PNG, JPG, GIF up to 500KB
                      </p>
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

              <Separator className={isDark ? 'bg-slate-700' : 'bg-gray-200'} />

              {/* Close Date */}
              <div className="space-y-2">
                <Label className={`${textPrimary} font-medium flex items-center gap-2`}>
                  <Calendar className="w-4 h-4" />
                  Close Date (Optional)
                </Label>
                <DatePicker
                  value={localSettings.close_date ? new Date(localSettings.close_date) : null}
                  onChange={(date) => handleChange('close_date', date ? date.toISOString() : null)}
                  placeholder="Pick a date"
                  minDate={new Date()}
                  clearable={true}
                  isDark={isDark}
                />
                <p className={`text-xs ${textSecondary}`}>
                  Survey will automatically stop accepting responses after this date
                </p>
              </div>

              {/* Max Responses */}
              <div className="space-y-2">
                <Label className={`${textPrimary} font-medium flex items-center gap-2`}>
                  <Hash className="w-4 h-4" />
                  Max Responses (Optional)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={localSettings.max_responses || ''}
                  onChange={(e) => handleChange('max_responses', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Unlimited"
                  className={inputBg}
                />
                <p className={`text-xs ${textSecondary}`}>
                  Survey will close after reaching this number of responses
                </p>
              </div>

              <Separator className={isDark ? 'bg-slate-700' : 'bg-gray-200'} />

              {/* Thank You Message */}
              <div className="space-y-2">
                <Label className={`${textPrimary} font-medium flex items-center gap-2`}>
                  <MessageSquare className="w-4 h-4" />
                  Thank You Message
                </Label>
                <Textarea
                  value={localSettings.thank_you_message || ''}
                  onChange={(e) => handleChange('thank_you_message', e.target.value)}
                  placeholder="Thank you for completing our survey!"
                  className={`${inputBg} min-h-[80px] resize-none`}
                />
                <p className={`text-xs ${textSecondary}`}>
                  Shown to respondents after submitting
                </p>
              </div>

              {/* Brand Color */}
              <div className="space-y-2">
                <Label className={`${textPrimary} font-medium flex items-center gap-2`}>
                  <Palette className="w-4 h-4" />
                  Brand Color
                </Label>
                <ColorPicker
                  value={localSettings.brand_color || '#14b8a6'}
                  onChange={(color) => handleChange('brand_color', color)}
                  showPresets={true}
                  showCustom={true}
                  showPreview={true}
                  previewText="Submit Survey"
                  isDark={isDark}
                />
                <p className={`text-xs ${textSecondary}`}>
                  Accent color for the public survey form
                </p>
              </div>

              <Separator className={isDark ? 'bg-slate-700' : 'bg-gray-200'} />

              {/* Toggle Options */}
              <div className="space-y-4">
                <Label className={`${textPrimary} font-medium flex items-center gap-2`}>
                  <ToggleLeft className="w-4 h-4" />
                  Options
                </Label>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textPrimary}`}>Show Progress Bar</p>
                    <p className={`text-xs ${textSecondary}`}>Display progress at the top</p>
                  </div>
                  <Switch
                    checked={localSettings.show_progress_bar ?? true}
                    onCheckedChange={(checked) => handleChange('show_progress_bar', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textPrimary}`}>Shuffle Questions</p>
                    <p className={`text-xs ${textSecondary}`}>Randomize question order</p>
                  </div>
                  <Switch
                    checked={localSettings.shuffle_questions ?? false}
                    onCheckedChange={(checked) => handleChange('shuffle_questions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textPrimary}`}>Allow Multiple Submissions</p>
                    <p className={`text-xs ${textSecondary}`}>Same user can submit again</p>
                  </div>
                  <Switch
                    checked={localSettings.allow_multiple_submissions ?? false}
                    onCheckedChange={(checked) => handleChange('allow_multiple_submissions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textPrimary}`}>Require Login</p>
                    <p className={`text-xs ${textSecondary}`}>Respondents must sign in</p>
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
                  <Separator className={isDark ? 'bg-slate-700' : 'bg-gray-200'} />
                  <div className="space-y-2">
                    <Label className={`${textPrimary} font-medium flex items-center gap-2`}>
                      <Link2 className="w-4 h-4" />
                      Public Survey Link
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={publicUrl}
                        readOnly
                        className={`${inputBg} text-sm flex-1`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyLink}
                        className={isDark ? 'border-slate-600' : 'border-gray-300'}
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className={`text-xs ${textSecondary}`}>
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
