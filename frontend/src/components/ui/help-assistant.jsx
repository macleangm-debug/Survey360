import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Suggested questions for quick access
const SUGGESTED_QUESTIONS = [
  "How do I create a survey?",
  "How do I share my survey?",
  "What's my response limit?",
  "How do I export responses?",
  "How do I add team members?",
  "What question types are available?",
];

export function HelpAssistant({ isDark = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Survey360 AI Assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText = null) => {
    const userMessage = (messageText || input).trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/help-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now. Please try again or browse the Help Center articles."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Theme styles
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-all hover:scale-105",
          "bg-gradient-to-r from-teal-500 to-teal-600 text-white",
          isOpen && "hidden"
        )}
        data-testid="help-assistant-btn"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "fixed bottom-24 right-6 w-96 h-[500px] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden",
            bgSecondary, borderColor, "border"
          )}
          data-testid="help-assistant-window"
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between px-4 py-3 border-b",
            borderColor, "bg-gradient-to-r from-teal-500/10 to-teal-600/10"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={cn("font-semibold text-sm", textPrimary)}>AI Assistant</h3>
                <p className={cn("text-xs", textSecondary)}>Powered by GPT-5.2</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={cn("p-1 rounded-lg hover:bg-white/10 transition-colors", textSecondary)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", bgPrimary)}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === 'user' 
                    ? "bg-blue-500/20" 
                    : "bg-gradient-to-r from-teal-500 to-teal-600"
                )}>
                  {msg.role === 'user' 
                    ? <User className="w-3.5 h-3.5 text-blue-400" />
                    : <Bot className="w-3.5 h-3.5 text-white" />
                  }
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === 'user'
                    ? "bg-blue-500 text-white rounded-br-md"
                    : cn(bgSecondary, textPrimary, "rounded-bl-md border", borderColor)
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Suggested Questions */}
            {showSuggestions && messages.length === 1 && !isLoading && (
              <div className="mt-2">
                <p className={cn("text-xs mb-2", textSecondary)}>Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(question)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-colors",
                        borderColor,
                        isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                        "text-teal-400 hover:text-teal-300"
                      )}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className={cn(bgSecondary, "rounded-2xl rounded-bl-md px-4 py-3 border", borderColor)}>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={cn("p-3 border-t", borderColor)}>
            <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2", isDark ? "bg-white/5" : "bg-gray-100")}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className={cn(
                  "flex-1 bg-transparent outline-none text-sm",
                  textPrimary, "placeholder-gray-500"
                )}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  input.trim() && !isLoading
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : "text-gray-500 cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
