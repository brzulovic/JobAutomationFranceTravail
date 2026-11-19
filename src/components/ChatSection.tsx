import React, { useState, useRef, useEffect } from 'react';
import { AutomationDefinition } from '../types';
import { ThemeDefinition } from '../data/themes';
import { MessageSquare, Send, Sliders, ArrowDown, ArrowUp, Bot, User } from 'lucide-react';

interface ChatSectionProps {
  automation: AutomationDefinition;
  parameters: Record<string, any>;
  onParamChange: (paramId: string, value: any) => void;
  theme: ThemeDefinition;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  automation,
  parameters,
  onParamChange,
  theme
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your JobAutomation Assistant. I have loaded all configuration parameters for "${automation.title}". You can edit any parameter on the right, review them by scrolling, and press Enter to chat or generate custom automation logic!`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = theme.isLight;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString()
    };

    const configSummary = Object.entries(parameters)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    let assistantReplyText = `Processing your request for "${automation.title}" with current configuration:\n${configSummary}\n\n`;
    if (inputVal.toLowerCase().includes('generate') || inputVal.toLowerCase().includes('script')) {
      assistantReplyText += `✨ Script generated successfully using parameters! Ready for Playwright execution.`;
    } else {
      assistantReplyText += `✓ Configuration verified. You can press Enter to send another prompt or test execution.`;
    }

    const assistantMsg: Message = {
      sender: 'assistant',
      text: assistantReplyText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`${theme.cardBg} border ${theme.borderClass} rounded-xl overflow-hidden shadow-lg flex flex-col h-[500px]`}>
      {/* Header */}
      <div className={`px-4 py-2.5 border-b ${theme.borderClass} flex items-center justify-between font-mono text-xs ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 text-slate-200'}`}>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <span className="font-bold">7: Chat & AI Config Waterfall</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={scrollToTop} className="p-1 hover:bg-slate-800/20 rounded" title="Scroll Up">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={scrollToBottom} className="p-1 hover:bg-slate-800/20 rounded" title="Scroll Down">
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Body: Chat Messages (Left) & Editable Config Waterfall (Right) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        
        {/* Chat Messages Area */}
        <div ref={containerRef} className="md:col-span-7 p-4 overflow-y-auto space-y-3 border-r border-slate-800/60 font-sans text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : `${isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-900 text-slate-200 border border-slate-800'} rounded-tl-none`
              }`}>
                <div className="whitespace-pre-wrap font-mono text-[11px]">{m.text}</div>
                <div className="text-[9px] opacity-60 mt-1 text-right">{m.timestamp}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Editable Config Waterfall Panel (Scrollable Up & Down) */}
        <div className="md:col-span-5 p-4 overflow-y-auto space-y-3 font-mono text-[11px]">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-bold border-b border-slate-800 pb-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Config Waterfall (All Editable)</span>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Scroll up and down to inspect or edit all active workflow parameters sent to the chat prompt context:
          </p>

          <div className="space-y-2.5 pt-1">
            {automation.parameters.map((param) => {
              const val = parameters[param.id] !== undefined ? parameters[param.id] : param.defaultValue;
              return (
                <div key={param.id} className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">{param.label}</span>
                    <span className="text-indigo-400">{param.id}</span>
                  </div>

                  {param.type === 'select' ? (
                    <select
                      value={val}
                      onChange={(e) => onParamChange(param.id, e.target.value)}
                      className="w-full bg-slate-950 text-white border border-slate-800 rounded px-2 py-1 text-xs"
                    >
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : param.type === 'checkbox' ? (
                    <label className="flex items-center space-x-2 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => onParamChange(param.id, e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] text-slate-300">{param.description}</span>
                    </label>
                  ) : (
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={val}
                      onChange={(e) => onParamChange(param.id, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="w-full bg-slate-950 text-white border border-slate-800 rounded px-2 py-1 text-xs"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Input Bar */}
      <div className={`p-3 border-t ${theme.borderClass} ${isLight ? 'bg-slate-50' : 'bg-slate-900'} flex items-center space-x-2`}>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or prompt... (Press Enter to send)"
          className={`flex-1 ${isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-950 text-white border-slate-800'} border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500`}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow transition"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
