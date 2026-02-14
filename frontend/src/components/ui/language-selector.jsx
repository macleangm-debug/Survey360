/**
 * Language Selector Component
 * Allows users to switch between available languages
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdown-menu';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { cn } from '../../lib/utils';

export function LanguageSelector({ variant = 'default', showLabel = false, className }) {
  const { i18n, t } = useTranslation();
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) 
    || SUPPORTED_LANGUAGES[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    // Update document direction for RTL languages
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    document.documentElement.dir = lang?.dir || 'ltr';
    document.documentElement.lang = langCode;
    // Store preference
    localStorage.setItem('survey360-language', langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" className={cn("text-muted-foreground hover:text-foreground", className)}>
            <Globe className="w-5 h-5" />
          </Button>
        ) : variant === 'minimal' ? (
          <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-foreground gap-1", className)}>
            <Globe className="w-4 h-4" />
            <span className="text-base">{currentLanguage.flag}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        ) : (
          <Button variant="outline" className={cn("gap-2", className)}>
            <Globe className="w-4 h-4" />
            {showLabel && (
              <>
                <span>{currentLanguage.nativeName}</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-[#0f1d32] border-white/10">
        <DropdownMenuLabel className="flex items-center gap-2 text-gray-400">
          <Globe className="w-4 h-4" />
          {t('settings.selectLanguage', 'Select Language')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer text-gray-300 hover:text-white hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-gray-500">{lang.name}</span>
              </div>
            </div>
            {i18n.language === lang.code && (
              <Check className="w-4 h-4 text-teal-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for header/navbar
export function LanguageSelectorCompact({ className }) {
  return <LanguageSelector variant="minimal" className={className} />;
}

// Icon-only version
export function LanguageSelectorIcon({ className }) {
  return <LanguageSelector variant="icon" className={className} />;
}

export default LanguageSelector;
