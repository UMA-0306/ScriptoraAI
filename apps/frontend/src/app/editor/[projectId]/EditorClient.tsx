'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import AIPanel from '@/components/AIPanel';
import { Clock, Users } from 'lucide-react';

// Dynamically import Editor client-side only (uses browser APIs)
const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-[#5a5a6a] text-sm">
      Loading editor…
    </div>
  ),
});

const DOC_META: Record<string, { title: string; type: string }> = {
  'sc-1': { title: 'Scene 1: The Dark Gate', type: 'Scene' },
  'sc-2': { title: 'Scene 2: First Light', type: 'Scene' },
  'sc-3': { title: 'Scene 1: Broken Steps', type: 'Scene' },
  'sc-4': { title: 'Scene 1: The Vault', type: 'Scene' },
  'ch-1': { title: 'Chapter 1: Dust & Bone', type: 'Chapter' },
  'ch-2': { title: 'Chapter 2: The Fall', type: 'Chapter' },
  'ch-3': { title: 'Chapter 3: Labyrinth', type: 'Chapter' },
  'act-1': { title: 'Act I — The Arrival', type: 'Act' },
  'act-2': { title: 'Act II — The Descent', type: 'Act' },
  'story-1': { title: 'The Obsidian Spire', type: 'Story' },
};

interface Props {
  projectId: string;
}

export default function EditorClient({ projectId }: Props) {
  const [activeDocId, setActiveDocId] = useState('sc-4');
  const [aiOpen, setAiOpen] = useState(false);

  const docMeta = DOC_META[activeDocId] ?? { title: 'Untitled Document', type: 'Scene' };

  return (
    <div className="h-screen flex overflow-hidden bg-[#0c0c0f]">
      {/* ── Sidebar Navigation ───────────────────────────────────── */}
      <Sidebar
        projectId={projectId}
        activeDocId={activeDocId}
        onDocSelect={setActiveDocId}
        onAiToggle={() => setAiOpen((v) => !v)}
        aiOpen={aiOpen}
      />

      {/* ── Main Editor Area ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Editor top bar */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-[#1e1e26] bg-[#0f0f13] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-semibold text-[#5a5a6a] uppercase tracking-widest shrink-0">
              {docMeta.type}
            </span>
            <span className="text-[#2a2a32]">/</span>
            <h1 className="text-sm font-semibold text-white truncate">{docMeta.title}</h1>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Collaborator avatars */}
            <div className="flex items-center">
              {['#7c3aed', '#10b981', '#f59e0b'].map((color, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: color, marginLeft: i > 0 ? '-6px' : 0 }}
                  className="w-7 h-7 rounded-full border-2 border-[#0f0f13] flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {['S', 'M', 'J'][i]}
                </div>
              ))}
              <span className="ml-2 text-xs text-[#9898a6] flex items-center gap-1">
                <Users size={11} /> 3 online
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#9898a6]">
              <Clock size={11} />
              <span>Saved just now</span>
            </div>
          </div>
        </div>

        {/* Editor scroll area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Editor
              projectId={projectId}
              documentId={activeDocId}
              documentTitle={docMeta.title}
            />
          </div>
        </div>
      </div>

      {/* ── AI Panel ─────────────────────────────────────────────── */}
      {aiOpen && (
        <AIPanel onClose={() => setAiOpen(false)} />
      )}
    </div>
  );
}
