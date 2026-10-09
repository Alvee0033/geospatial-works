"use client";

import React, { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  Clock, 
  Phone, 
  Mail, 
  ChevronDown, 
  Headset,
  ArrowUpRight,
  Globe,
  Sparkles
} from 'lucide-react';

interface SupportChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportChatbot({ isOpen, onClose }: SupportChatbotProps) {
  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Welcome to Geospatial Works. How can our spatial engineering team assist you today?",
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickReplies = [
    { label: "Call Us", action: "href", href: "tel:+8801303772216", icon: <Phone size={12} /> },
    { label: "Email Support", action: "href", href: "mailto:info@geospatialworks.com", icon: <Mail size={12} /> },
    { label: "Business Hours", action: "query", query: "What are your business hours?", icon: <Clock size={12} /> },
    { label: "WebGIS Services", action: "query", query: "What services do you provide?", icon: <Globe size={12} /> },
  ];

  const handleQuickQuery = (query: string) => {
    append({ role: 'user', content: query });
  };

  // Formats responses into point-by-point items with emerald bullet dots
  const renderFormattedMessage = (text: string) => {
    const cleanedText = text.replace(/\*\*/g, '').replace(/#/g, '');
    const lines = cleanedText.split('\n').filter(Boolean);

    return (
      <div className="space-y-2 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•') || /^\d+[\.\)]/.test(trimmed);
          const cleanText = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+[\.\)]\s*/, '');

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start space-x-2 my-1 pl-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20bc2e] shrink-0 mt-1.5 inline-block shadow-2xs" />
                <span className="text-xs sm:text-sm text-gray-800 font-medium">{cleanText}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs sm:text-sm">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed bottom-16 sm:bottom-20 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-[410px] h-[min(560px,calc(100dvh-85px))] bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.14)] border border-emerald-900/10 z-[998] flex flex-col overflow-hidden text-gray-900 font-sans"
        >
          {/* Top Light Brand Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between text-gray-900 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl bg-[#f4faf6] p-1 border border-[#20bc2e]/20 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Geospatial Works Logo" width={36} height={36} decoding="async" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-gray-900 tracking-tight leading-tight">Geospatial Works</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#20bc2e]/10 text-[#127a1b] border border-[#20bc2e]/20 uppercase tracking-wider">
                    <Sparkles size={10} className="text-[#20bc2e]" />
                    Support
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20bc2e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20bc2e]"></span>
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">Online & Ready</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
              aria-label="Close Chat"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Talk to Real Person Action Banner */}
          <div className="bg-[#f2faf4] px-4 py-2 border-b border-[#20bc2e]/15 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-[#20bc2e]/15 flex items-center justify-center text-[#127a1b]">
                <Headset size={14} />
              </div>
              <span className="text-xs font-bold text-gray-800">Need human help?</span>
            </div>
            <a
              href="tel:+8801303772216"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#122417] hover:bg-[#1b3623] text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:scale-102 active:scale-98"
            >
              <Phone size={12} className="text-[#20bc2e]" />
              <span>Talk to Real Person</span>
              <ArrowUpRight size={12} className="text-[#20bc2e]" />
            </a>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f8faf9] space-y-4">
            {messages.map((m) => {
              // Only render explicit contact buttons if response contains explicit phone/email info
              const isExplicitContactInfo = m.role === 'assistant' && (
                m.content.includes('+8801303772216') || 
                m.content.toLowerCase().includes('info@geospatialworks.com')
              );

              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 max-w-[88%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                      m.role === 'user'
                        ? 'bg-[#122417] text-white'
                        : 'bg-white border border-gray-200 p-0.5'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <User size={13} />
                    ) : (
                      <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                      m.role === 'user'
                        ? 'bg-[#20bc2e] text-white rounded-tr-xs shadow-sm font-medium'
                        : 'bg-white text-gray-800 border border-gray-100/80 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {renderFormattedMessage(m.content)}

                    {/* Contact Action Buttons rendered ONLY when explicitly relevant */}
                    {isExplicitContactInfo && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-2">
                        <a
                          href="tel:+8801303772216"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#f4faf6] hover:bg-emerald-100 text-[#127a1b] text-xs font-bold rounded-xl border border-[#20bc2e]/25 transition-colors"
                        >
                          <Phone size={12} className="text-[#20bc2e]" />
                          <span>Call (+8801303772216)</span>
                        </a>
                        <a
                          href="mailto:info@geospatialworks.com"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 transition-colors"
                        >
                          <Mail size={12} className="text-gray-600" />
                          <span>Email Team</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-xl bg-white border border-gray-200 p-0.5 shrink-0 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-gray-100 flex gap-1.5 items-center shadow-xs">
                  <div className="w-2 h-2 bg-[#20bc2e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#20bc2e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#20bc2e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Real Icon Quick Action Pills */}
          <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickReplies.map((reply, i) => (
              reply.action === 'query' ? (
                <button
                  key={i}
                  onClick={() => handleQuickQuery(reply.query!)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-xs font-medium rounded-full border border-gray-200/70 transition-colors shrink-0"
                >
                  <span className="text-gray-500">{reply.icon}</span>
                  <span>{reply.label}</span>
                </button>
              ) : (
                <a
                  key={i}
                  href={reply.href}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#f4faf6] hover:bg-emerald-100 text-[#127a1b] text-xs font-bold rounded-full border border-[#20bc2e]/30 transition-colors shrink-0"
                >
                  <span className="text-[#20bc2e]">{reply.icon}</span>
                  <span>{reply.label}</span>
                </a>
              )
            ))}
          </div>

          {/* Bottom Message Form */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about GIS, services, or contact..."
                disabled={isLoading}
                className="w-full pl-4 pr-11 py-2.5 bg-gray-100 focus:bg-white border border-transparent focus:border-[#20bc2e] rounded-xl outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-2 bg-[#20bc2e] hover:bg-emerald-600 text-white rounded-lg disabled:opacity-40 disabled:bg-gray-300 transition-all shadow-xs active:scale-95"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
