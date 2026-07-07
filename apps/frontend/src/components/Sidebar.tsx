'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PenLine, ChevronRight, ChevronDown, BookOpen, Film,
  FileText, Plus, Search, FolderOpen, Hash,
  Users, Zap, Home
} from 'lucide-react';

interface NavItem {
  id: string;
  title: string;
  type: 'STORY' | 'ACT' | 'CHAPTER' | 'SCENE';
  children?: NavItem[];
}

const MOCK_TREE: NavItem[] = [
  {
    id: 'story-1',
    title: 'The Obsidian Spire',
    type: 'STORY',
    children: [
      {
        id: 'act-1',
        title: 'Act I — The Arrival',
        type: 'ACT',
        children: [
          { id: 'ch-1', title: 'Chapter 1: Dust & Bone', type: 'CHAPTER', children: [
            { id: 'sc-1', title: 'Scene 1: The Dark Gate', type: 'SCENE' },
            { id: 'sc-2', title: 'Scene 2: First Light', type: 'SCENE' },
          ]},
          { id: 'ch-2', title: 'Chapter 2: The Fall', type: 'CHAPTER', children: [
            { id: 'sc-3', title: 'Scene 1: Broken Steps', type: 'SCENE' },
          ]},
        ],
      },
      {
        id: 'act-2',
        title: 'Act II — The Descent',
        type: 'ACT',
        children: [
          { id: 'ch-3', title: 'Chapter 3: Labyrinth', type: 'CHAPTER', children: [
            { id: 'sc-4', title: 'Scene 1: The Vault', type: 'SCENE' },
          ]},
        ],
      },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  STORY:   'text-violet-400',
  ACT:     'text-indigo-400',
  CHAPTER: 'text-sky-400',
  SCENE:   'text-[#9898a6]',
};

const TYPE_LABELS: Record<string, string> = {
  STORY: 'S', ACT: 'A', CHAPTER: 'C', SCENE: '·',
};

interface TreeNodeProps {
  node: NavItem;
  depth?: number;
  activeId: string;
  onSelect: (id: string) => void;
}

function TreeNode({ node, depth = 0, activeId, onSelect }: TreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.id === activeId;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setOpen(!open);
          onSelect(node.id);
        }}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        className={`w-full flex items-center gap-2 py-1.5 pr-3 rounded-lg text-left text-sm
                    transition-colors group
                    ${isActive
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-[#9898a6] hover:text-white hover:bg-[#1a1a1f]'
                    }`}
      >
        {hasChildren ? (
          open
            ? <ChevronDown size={12} className="shrink-0 opacity-60" />
            : <ChevronRight size={12} className="shrink-0 opacity-60" />
        ) : (
          <span className="w-3 text-center text-xs opacity-40">{TYPE_LABELS[node.type]}</span>
        )}
        <span className={`font-medium text-xs shrink-0 ${TYPE_COLORS[node.type]}`}>
          {node.type === 'STORY' ? '📖' : node.type === 'ACT' ? '§' : node.type === 'CHAPTER' ? '#' : ''}
        </span>
        <span className="truncate text-[13px]">{node.title}</span>
      </button>

      {open && hasChildren && (
        <div className="mt-0.5">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} activeId={activeId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  projectId: string;
  activeDocId: string;
  onDocSelect: (id: string) => void;
  onAiToggle: () => void;
  aiOpen: boolean;
}

export default function Sidebar({ projectId, activeDocId, onDocSelect, onAiToggle, aiOpen }: Props) {
  const [search, setSearch] = useState('');

  return (
    <aside className="flex flex-col w-[260px] min-w-[260px] bg-[#0f0f13] border-r border-[#1e1e26] h-full select-none">
      {/* ── Logo Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#1e1e26] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <PenLine size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">ScriptoraAI</span>
        </div>
        <Link href="/" className="p-1.5 rounded-lg text-[#5a5a6a] hover:text-white hover:bg-[#1a1a1f] transition-colors">
          <Home size={14} />
        </Link>
      </div>

      {/* ── Search ────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-b border-[#1e1e26] shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5a5a6a]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full pl-8 pr-3 py-2 bg-[#131316] border border-[#2a2a32] rounded-lg text-xs text-white placeholder:text-[#5a5a6a] focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* ── Document Tree ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-[10px] font-semibold text-[#5a5a6a] uppercase tracking-widest">Narrative</span>
          <button className="p-1 rounded hover:bg-[#1a1a1f] text-[#5a5a6a] hover:text-white transition-colors">
            <Plus size={12} />
          </button>
        </div>

        {MOCK_TREE.map((node) => (
          <TreeNode key={node.id} node={node} activeId={activeDocId} onSelect={onDocSelect} />
        ))}
      </div>

      {/* ── World Bible Section ───────────────────────────────────── */}
      <div className="border-t border-[#1e1e26] px-2 py-3 space-y-0.5 shrink-0">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-semibold text-[#5a5a6a] uppercase tracking-widest">World Bible</span>
        </div>

        {[
          { icon: Users, label: 'Characters', count: 8 },
          { icon: FolderOpen, label: 'Locations', count: 5 },
          { icon: Hash, label: 'Story Arcs', count: 3 },
        ].map(({ icon: Icon, label, count }) => (
          <button
            key={label}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#9898a6] hover:text-white hover:bg-[#1a1a1f] transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <Icon size={13} />
              <span className="text-[13px]">{label}</span>
            </div>
            <span className="text-[10px] bg-[#2a2a32] px-1.5 py-0.5 rounded-full text-[#9898a6]">{count}</span>
          </button>
        ))}
      </div>

      {/* ── AI Toggle ─────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-[#1e1e26] shrink-0">
        <button
          onClick={onAiToggle}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${aiOpen
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
              : 'bg-[#131316] text-[#9898a6] border border-[#2a2a32] hover:text-white hover:border-violet-500/40'
            }`}
        >
          <Zap size={14} />
          {aiOpen ? 'Close AI Panel' : 'Open AI Panel'}
        </button>
      </div>
    </aside>
  );
}
