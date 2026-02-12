import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Link,
  QrCode,
  Code,
  Copy,
  Check,
  ExternalLink,
  Download,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Tabs configuration
const SHARE_TABS = [
  { id: 'link', label: 'Link', icon: Link },
  { id: 'qrcode', label: 'QR Code', icon: QrCode },
  { id: 'embed', label: 'Embed', icon: Code },
];

/**
 * ShareSurveyDialog - A reusable dialog for sharing surveys via Link, QR Code, or Embed
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {function} props.onClose - Callback when dialog is closed
 * @param {string} props.surveyName - Name of the survey being shared
 * @param {string} props.surveyUrl - Public URL of the survey
 * @param {string} props.surveyId - Unique ID of the survey (used for embed)
 * @param {string} props.theme - 'dark' or 'light' theme
 * @param {function} props.onCopySuccess - Optional callback when link is copied
 */
export function ShareSurveyDialog({
  isOpen,
  onClose,
  surveyName = 'My Survey',
  surveyUrl = '',
  surveyId = '',
  theme = 'dark',
  onCopySuccess,
}) {
  const [activeTab, setActiveTab] = useState('link');
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const isDark = theme === 'dark';

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-white';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-gray-50';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const inputBg = isDark ? 'bg-[#0a1628]' : 'bg-gray-100';

  // Generate embed code
  const embedCode = `<iframe 
  src="${surveyUrl}?embed=true" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border: none; border-radius: 8px;"
  title="${surveyName}"
></iframe>`;

  // Copy to clipboard handler
  const handleCopy = async (text, type = 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setEmbedCopied(true);
        setTimeout(() => setEmbedCopied(false), 2000);
      }
      onCopySuccess?.(type);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Open survey in new tab
  const handleOpenInNewTab = () => {
    window.open(surveyUrl, '_blank');
  };

  // Download QR Code
  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${surveyName.replace(/\s+/g, '-')}-qr-code.png`;
      link.href = url;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
            data-testid="share-dialog-backdrop"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg ${bgPrimary} rounded-xl shadow-2xl z-50 border ${borderColor} overflow-hidden`}
            data-testid="share-survey-dialog"
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <Share2 className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${textPrimary}`}>Share Survey</h2>
                  <p className={`text-sm ${textMuted}`}>{surveyName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}
                data-testid="share-dialog-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex px-6 pt-4 gap-2`}>
              {SHARE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-teal-500/10 text-teal-500 border border-teal-500/30'
                        : `${textSecondary} ${hoverBg} border border-transparent`
                    )}
                    data-testid={`share-tab-${tab.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Link Tab */}
              {activeTab === 'link' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Public Survey Link
                    </label>
                    <div className="flex gap-2">
                      <div className={`flex-1 flex items-center px-4 py-3 ${inputBg} border ${borderColor} rounded-lg`}>
                        <span className={`text-sm ${textPrimary} truncate`}>
                          {surveyUrl || 'https://your-domain.com/survey/...'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(surveyUrl)}
                        className={cn(
                          'px-4 py-3 rounded-lg transition-all flex items-center justify-center min-w-[52px]',
                          copied
                            ? 'bg-teal-500 text-white'
                            : 'bg-teal-500 hover:bg-teal-600 text-white'
                        )}
                        data-testid="copy-link-btn"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className={`text-xs ${textMuted} mt-2`}>
                      Share this link with anyone to collect responses. No login required for respondents.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenInNewTab}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 border ${borderColor} rounded-lg ${textSecondary} ${hoverBg} transition-colors`}
                    data-testid="open-new-tab-btn"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Survey in New Tab
                  </button>
                </div>
              )}

              {/* QR Code Tab */}
              {activeTab === 'qrcode' && (
                <div className="space-y-4">
                  <div className={`flex justify-center p-6 ${bgSecondary} rounded-lg border ${borderColor}`}>
                    {/* QR Code Placeholder - Replace with actual QR code library */}
                    <div className="relative">
                      <canvas
                        id="qr-code-canvas"
                        className="w-48 h-48 bg-white rounded-lg p-4"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      {/* QR Code visual placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center">
                          <QrCode className="w-32 h-32 text-gray-800" strokeWidth={1} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className={`text-center text-xs ${textMuted}`}>
                    Scan this QR code to open the survey on any device
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadQR}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                      data-testid="download-qr-btn"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                    <button
                      onClick={() => handleCopy(surveyUrl)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border ${borderColor} rounded-lg ${textSecondary} ${hoverBg} transition-colors`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              {/* Embed Tab */}
              {activeTab === 'embed' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Embed Code
                    </label>
                    <div className={`relative p-4 ${inputBg} border ${borderColor} rounded-lg`}>
                      <pre className={`text-xs ${textPrimary} overflow-x-auto whitespace-pre-wrap font-mono`}>
                        {embedCode}
                      </pre>
                      <button
                        onClick={() => handleCopy(embedCode, 'embed')}
                        className={cn(
                          'absolute top-2 right-2 p-2 rounded-lg transition-all',
                          embedCopied
                            ? 'bg-teal-500 text-white'
                            : `${hoverBg} ${textSecondary}`
                        )}
                        data-testid="copy-embed-btn"
                      >
                        {embedCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className={`text-xs ${textMuted} mt-2`}>
                      Paste this code into your website's HTML to embed the survey directly.
                    </p>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Preview
                    </label>
                    <div className={`${bgSecondary} border ${borderColor} rounded-lg p-4 h-32 flex items-center justify-center`}>
                      <div className={`text-center ${textMuted}`}>
                        <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Survey will appear here when embedded</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * SurveyActionsMenu - A dropdown menu with survey actions including share
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls menu visibility
 * @param {function} props.onClose - Callback when menu is closed
 * @param {function} props.onEdit - Edit survey callback
 * @param {function} props.onUnpublish - Unpublish survey callback
 * @param {function} props.onShare - Share survey callback
 * @param {function} props.onOpenPublic - Open public form callback
 * @param {function} props.onDuplicate - Duplicate survey callback
 * @param {function} props.onDelete - Delete survey callback
 * @param {boolean} props.isPublished - Whether survey is published
 * @param {string} props.theme - 'dark' or 'light' theme
 */
export function SurveyActionsMenu({
  isOpen,
  onClose,
  onEdit,
  onUnpublish,
  onShare,
  onOpenPublic,
  onDuplicate,
  onDelete,
  isPublished = true,
  theme = 'dark',
  position = { top: 0, left: 0 },
}) {
  const isDark = theme === 'dark';

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const menuItems = [
    {
      id: 'edit',
      label: 'Edit Survey',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
        </svg>
      ),
      onClick: onEdit,
    },
    {
      id: 'unpublish',
      label: isPublished ? 'Unpublish' : 'Publish',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      onClick: onUnpublish,
    },
    {
      id: 'share',
      label: 'Share (Link, QR, Embed)',
      icon: <Share2 className="w-5 h-5" />,
      onClick: onShare,
      highlight: true,
    },
    {
      id: 'open',
      label: 'Open Public Form',
      icon: <ExternalLink className="w-5 h-5" />,
      onClick: onOpenPublic,
    },
    { id: 'divider' },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-5 h-5" />,
      onClick: onDuplicate,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      ),
      onClick: onDelete,
      danger: true,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            style={position}
            className={`absolute z-50 min-w-[220px] ${bgPrimary} border ${borderColor} rounded-lg shadow-xl py-2`}
            data-testid="survey-actions-menu"
          >
            {menuItems.map((item) => {
              if (item.id === 'divider') {
                return <div key={item.id} className={`my-2 border-t ${borderColor}`} />;
              }
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick?.();
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                    item.danger
                      ? 'text-red-500 hover:bg-red-500/10'
                      : item.highlight
                      ? `text-teal-500 ${hoverBg}`
                      : `${textSecondary} ${hoverBg}`
                  )}
                  data-testid={`action-${item.id}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShareSurveyDialog;
