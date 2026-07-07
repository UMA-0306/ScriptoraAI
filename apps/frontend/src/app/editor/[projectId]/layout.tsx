import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editor — ScriptoraAI',
  description: 'Collaborative narrative editor with real-time syncing and AI assistance.',
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full">{children}</div>;
}
