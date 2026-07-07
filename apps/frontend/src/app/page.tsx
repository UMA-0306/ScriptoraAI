'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  PenLine, Folder, Clock, Star, ChevronRight,
  Plus, Search, Sparkles, Users, BookOpen, Film, FileText
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: 'proj-1',
    name: 'The Obsidian Spire',
    type: 'Novel',
    icon: '📖',
    description: 'A dark fantasy epic spanning three generations of a cursed bloodline.',
    updatedAt: '2 hours ago',
    collaborators: 3,
    wordCount: 42850,
    starred: true,
  },
  {
    id: 'proj-2',
    name: 'Neon Horizon',
    type: 'Screenplay',
    icon: '🎬',
    description: 'A neo-noir thriller set in a rain-soaked cyberpunk metropolis, 2091.',
    updatedAt: '1 day ago',
    collaborators: 2,
    wordCount: 18200,
    starred: true,
  },
  {
    id: 'proj-3',
    name: 'The Last Cartographer',
    type: 'Series Bible',
    icon: '🗺️',
    description: 'Six-season streaming series about the last keeper of physical maps in a post-digital world.',
    updatedAt: '3 days ago',
    collaborators: 5,
    wordCount: 67300,
    starred: false,
  },
  {
    id: 'proj-4',
    name: 'Echoes of the Pale Shore',
    type: 'Novel',
    icon: '🌊',
    description: 'A literary ghost story told across three timelines on the coast of Maine.',
    updatedAt: '1 week ago',
    collaborators: 1,
    wordCount: 31400,
    starred: false,
  },
];

const ACTIVITY = [
  { action: 'AI consistency check found 2 issues in', doc: 'Chapter 7 — The Vault', time: '5m ago' },
  { action: 'Collaborator Maya edited', doc: 'Act II Scene 4', time: '23m ago' },
  { action: 'Story beat generated for', doc: 'The Obsidian Spire — Climax Arc', time: '1h ago' },
  { action: 'Character profile updated:', doc: 'Aria Voss — The Cartographer', time: '2h ago' },
];

// ─── Components ───────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#131316] border border-[#2a2a32] rounded-xl p-5 flex items-center gap-4 hover:border-[#3a3a48] transition-colors">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-[#9898a6]">{label}</p>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: typeof MOCK_PROJECTS[0] }) {
  const typeIcon = project.type === 'Novel' ? BookOpen :
                   project.type === 'Screenplay' ? Film : FileText;
  const TypeIcon = typeIcon;

  return (
    <Link href={`/editor/${project.id}`}>
      <div className="group bg-[#131316] border border-[#2a2a32] rounded-xl p-5 cursor-pointer
                      hover:border-violet-500/40 hover:bg-[#161619] hover:shadow-[0_0_24px_rgba(124,58,237,0.08)]
                      transition-all duration-200 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{project.icon}</span>
            <div>
              <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors text-base">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TypeIcon size={12} className="text-[#9898a6]" />
                <span className="text-xs text-[#9898a6]">{project.type}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project.starred && (
              <Star size={14} className="fill-amber-400 text-amber-400" />
            )}
            <ChevronRight size={16} className="text-[#5a5a6a] group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#9898a6] leading-relaxed line-clamp-2">{project.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1e1e26]">
          <div className="flex items-center gap-3 text-xs text-[#5a5a6a]">
            <span className="flex items-center gap-1">
              <Users size={11} /> {project.collaborators}
            </span>
            <span className="flex items-center gap-1">
              <PenLine size={11} /> {project.wordCount.toLocaleString()} words
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#5a5a6a]">
            <Clock size={11} /> {project.updatedAt}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────
export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'starred'>('all');

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' || p.starred;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-full bg-[#0c0c0f] flex flex-col">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e26] bg-[#0c0c0f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.4)]">
              <PenLine size={15} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ScriptoraAI</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#9898a6]">
            <span className="text-violet-400 font-medium">Dashboard</span>
            <span className="hover:text-white cursor-pointer transition-colors">Characters</span>
            <span className="hover:text-white cursor-pointer transition-colors">Locations</span>
            <span className="hover:text-white cursor-pointer transition-colors">Timeline</span>
          </nav>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.5)] transition-all duration-200">
              <Plus size={15} />
              New Project
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              SU
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="border-b border-[#1e1e26] bg-gradient-to-b from-[#100f18] to-[#0c0c0f]">
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-400 uppercase tracking-widest">Your Workspace</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
            Welcome back, Storyteller.
          </h1>
          <p className="text-[#9898a6] text-lg max-w-xl">
            Your narratives live here. Pick up where you left off, or start a new world.
          </p>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-in">
          <StatCard label="Active Projects" value="4" icon={Folder} color="bg-violet-700" />
          <StatCard label="Total Words" value="159K" icon={PenLine} color="bg-indigo-700" />
          <StatCard label="Collaborators" value="11" icon={Users} color="bg-emerald-700" />
          <StatCard label="AI Sessions" value="38" icon={Sparkles} color="bg-amber-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Left: Projects */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a6a]" />
                <input
                  type="text"
                  placeholder="Search projects…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#131316] border border-[#2a2a32] rounded-lg text-sm text-white placeholder:text-[#5a5a6a] focus:outline-none focus:border-violet-500/60 transition-colors"
                />
              </div>
              <div className="flex rounded-lg overflow-hidden border border-[#2a2a32] text-sm">
                {(['all', 'starred'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 capitalize transition-colors ${
                      filter === f
                        ? 'bg-violet-600 text-white'
                        : 'bg-[#131316] text-[#9898a6] hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((project, i) => (
                <div key={project.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in">
                  <ProjectCard project={project} />
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-16 text-[#5a5a6a]">
                  No projects match your search.
                </div>
              )}
            </div>
          </div>

          {/* Right: Activity Feed */}
          <div className="animate-fade-in" style={{ animationDelay: '120ms' }}>
            <h2 className="text-sm font-semibold text-[#9898a6] uppercase tracking-widest mb-4">Recent Activity</h2>
            <div className="flex flex-col gap-3">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="bg-[#131316] border border-[#2a2a32] rounded-xl p-4 hover:border-[#3a3a48] transition-colors">
                  <p className="text-sm text-[#9898a6] leading-snug">
                    {item.action}{' '}
                    <span className="text-violet-300 font-medium">{item.doc}</span>
                  </p>
                  <p className="text-xs text-[#5a5a6a] mt-1.5">{item.time}</p>
                </div>
              ))}
            </div>

            {/* AI Quick Launch */}
            <div className="mt-6 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">AI Assistant</span>
              </div>
              <p className="text-xs text-[#9898a6] mb-4 leading-relaxed">
                Generate story beats, check continuity, or draft a scene instantly.
              </p>
              <button className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors animate-glow">
                Launch AI Panel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
