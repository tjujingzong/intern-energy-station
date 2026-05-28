import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Trash2, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../types';
import { chat, hasKey } from '../api/deepseek';
import { useData } from '../store/dataStore';

interface AIChatProps {
  storageKey: string;
  systemPrompt: string;
  placeholder?: string;
  hint?: string;
  quickPrompts?: string[];
  height?: string;
}

export default function AIChat({
  storageKey,
  systemPrompt,
  placeholder = '请输入问题…',
  hint,
  quickPrompts = [],
  height = '460px',
}: AIChatProps) {
  const history = useData((s) => s.chatHistory[storageKey] || []);
  const appendChat = useData((s) => s.appendChat);
  const clearChat = useData((s) => s.clearChat);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' });
  }, [history, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { role: 'user', content, ts: Date.now() };
    appendChat(storageKey, [userMsg]);
    setInput('');
    setLoading(true);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      userMsg,
    ];
    try {
      const reply = await chat(messages);
      appendChat(storageKey, [{ role: 'assistant', content: reply, ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-0 flex flex-col" style={{ height }}>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Sparkles size={16} className="text-brand-600" />
          AI 助手
          {!hasKey() && (
            <span className="badge bg-amber-100 text-amber-700 ml-2">本地模拟模式</span>
          )}
        </div>
        <button
          onClick={() => clearChat(storageKey)}
          className="text-slate-400 hover:text-rose-500"
          title="清空对话"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
        {hint && history.length === 0 && (
          <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3 leading-relaxed">
            {hint}
          </div>
        )}
        {history.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={14} /> AI 正在思考…
          </div>
        )}
      </div>

      {quickPrompts.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-slate-100 p-3 flex items-end gap-2">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          className="flex-1 resize-none input"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="btn-primary"
        >
          <Send size={14} />
          发送
        </button>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === 'system') return null;
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-600 text-white rounded-br-sm'
            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}
