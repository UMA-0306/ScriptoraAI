'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, X, Send, Loader2, AlertTriangle,
  BookText, BarChart2, CheckCircle2, ChevronDown, Bot
} from 'lucide-react';

type AgentMode = 'write' | 'plan' | 'check';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: AgentMode;
  issues?: ConsistencyIssue[];
}

interface ConsistencyIssue {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  issue_description: string;
  source_reference?: string;
  suggested_fix?: string;
}

const SEVERITY_STYLES = {
  CRITICAL: { bg: 'bg-rose-900/30', border: 'border-rose-500/40', text: 'text-rose-300', icon: AlertTriangle },
  WARNING:  { bg: 'bg-amber-900/30', border: 'border-amber-500/40', text: 'text-amber-300', icon: AlertTriangle },
  INFO:     { bg: 'bg-sky-900/30',   border: 'border-sky-500/40',   text: 'text-sky-300',   icon: CheckCircle2 },
};

const MODE_CONFIG: Record<AgentMode, { label: string; icon: any; prompt: string; color: string }> = {
  write: {
    label: 'Writer',
    icon: BookText,
    prompt: 'Ask the Writer Agent to draft a scene, expand an outline, or refine dialogue…',
    color: 'text-violet-400',
  },
  plan: {
    label: 'Story Planner',
    icon: BarChart2,
    prompt: 'Ask the Story Planner to suggest beats, arcs, or structural improvements…',
    color: 'text-indigo-400',
  },
  check: {
    label: 'Consistency',
    icon: CheckCircle2,
    prompt: 'Paste text or describe a scene to check for continuity issues…',
    color: 'text-emerald-400',
  },
};

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `I'm your ScriptoraAI assistant — four agents working together to help you write and plan your narrative.\n\n**Switch modes** using the tabs above to:\n- **Write** — Draft scenes, expand outlines, refine dialogue\n- **Plan** — Generate story beats and structure suggestions\n- **Check** — Validate consistency against your narrative memory`,
};

// Simulated AI responses for demo
const DEMO_RESPONSES: Record<AgentMode, string> = {
  write: `John's fingers found the cold steel of the vault door before his eyes adjusted to the dark. The mechanism was old — far older than the schematics had suggested — its surface pitted with rust the colour of dried blood. He pressed his ear to the metal. \n\nSilence. Then, barely audible, a rhythmic clicking from somewhere deep within the wall.\n\n*They were still running*, he realized. After all these years, something inside was still running.`,
  plan: `Based on your current narrative position in **Act II**, here are the next recommended story beats:\n\n1. **Midpoint Reversal** — John discovers the vault wasn't locked to keep people *out*, but to keep something *in*.\n2. **Stakes Escalation** — A second character arrives with conflicting motivations for accessing the vault.\n3. **False Victory** — The vault opens, but reveals a clue rather than the answer John expected.\n4. **Dark Night of the Soul** — John must decide whether to continue alone or trust the newcomer.\n\nThis follows the Save the Cat! beat structure with ~35% story completion.`,
  check: `**Consistency Analysis Complete** — 1 issue found:\n\nI analyzed the submitted draft against your character profiles and found a continuity concern.`,
};

const DEMO_ISSUE: ConsistencyIssue = {
  severity: 'CRITICAL',
  issue_description: "John runs and vaults over debris in the submitted draft. However, in **Chapter 2: The Fall**, John sustained a fractured left femur that was established as not yet healed at this story point.",
  source_reference: 'Chapter 2: The Fall',
  suggested_fix: 'Show John moving with difficulty — perhaps dragging his left leg, using the wall for support, or explicitly noting he has since recovered.',
};

export default function AIPanel({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<AgentMode>('write');
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulated streaming delay
    await new Promise((r) => setTimeout(r, 1400 + Math.random() * 800));

    const assistantMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: DEMO_RESPONSES[mode],
      mode,
      issues: mode === 'check' ? [DEMO_ISSUE] : undefined,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  }

  const ModeIcon = MODE_CONFIG[mode].icon;

  return (
    <div className="flex flex-col w-[340px] min-w-[340px] bg-[#0f0f13] border-l border-[#1e1e26] h-full animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#1e1e26] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Sparkles size={13} className="text-violet-400" />
          </div>
          <span className="font-semibold text-white text-sm">AI Assistant</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#5a5a6a] hover:text-white hover:bg-[#1a1a1f] transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-[#1e1e26] shrink-0">
        {(Object.keys(MODE_CONFIG) as AgentMode[]).map((m) => {
          const cfg = MODE_CONFIG[m];
          const Icon = cfg.icon;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors
                ${mode === m
                  ? `border-b-2 border-violet-500 ${cfg.color}`
                  : 'text-[#5a5a6a] hover:text-[#9898a6]'
                }`}
            >
              <Icon size={12} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                <Bot size={11} className="text-violet-400" />
              </div>
            )}
            <div className={`max-w-[90%] ${msg.role === 'user'
              ? 'bg-violet-600/20 border border-violet-500/30 text-violet-100 rounded-2xl rounded-tr-sm px-4 py-2.5'
              : 'text-[#c0c0cc]'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="text-[13px] leading-relaxed space-y-2">
                  {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold text-white">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return <p key={i} className="pl-3 text-[#9898a6]">• {line.slice(2)}</p>;
                    }
                    if (/^\d+\./.test(line)) {
                      return <p key={i} className="pl-3 text-[#c0c0cc]">{line}</p>;
                    }
                    if (line === '') return <div key={i} className="h-1" />;
                    return <p key={i}>{line}</p>;
                  })}

                  {/* Consistency Issues */}
                  {msg.issues?.map((issue, i) => {
                    const style = SEVERITY_STYLES[issue.severity];
                    const Icon = style.icon;
                    return (
                      <div key={i} className={`mt-3 p-3 rounded-xl border ${style.bg} ${style.border}`}>
                        <div className={`flex items-center gap-1.5 text-xs font-bold mb-2 ${style.text}`}>
                          <Icon size={12} />
                          {issue.severity}
                        </div>
                        <p className="text-xs text-[#c0c0cc] leading-relaxed mb-2">{issue.issue_description}</p>
                        {issue.source_reference && (
                          <p className="text-xs text-[#9898a6]">📎 Ref: <span className="text-violet-300">{issue.source_reference}</span></p>
                        )}
                        {issue.suggested_fix && (
                          <div className="mt-2 pt-2 border-t border-[#2a2a32]">
                            <p className="text-xs text-emerald-400 font-semibold mb-1">Suggested Fix</p>
                            <p className="text-xs text-[#9898a6] leading-relaxed">{issue.suggested_fix}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-[#5a5a6a] text-xs pl-8">
            <Loader2 size={13} className="animate-spin" />
            <span>{MODE_CONFIG[mode].label} Agent is thinking…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#1e1e26] shrink-0">
        <div className="flex gap-2">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={MODE_CONFIG[mode].prompt}
            className="flex-1 bg-[#131316] border border-[#2a2a32] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-[#5a5a6a] focus:outline-none focus:border-violet-500/60 resize-none transition-colors leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="self-end p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p className="text-[10px] text-[#5a5a6a] mt-2 text-center">⏎ Send · ⇧⏎ New line</p>
      </div>
    </div>
  );
}
