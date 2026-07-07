import { Metadata } from 'next';
import EditorClient from './EditorClient';

export const metadata: Metadata = {
  title: 'Editor — ScriptoraAI',
  description: 'Collaborative narrative editor with real-time syncing and AI assistance.',
};

// Server Component — unwraps params and passes plain values to the Client Component
export default async function EditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <EditorClient projectId={projectId} />;
}
