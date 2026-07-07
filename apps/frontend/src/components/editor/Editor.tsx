'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { SocketIOProvider } from './SocketIOProvider';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Code, Quote, Undo, Redo, Sparkles
} from 'lucide-react';

interface EditorProps {
  projectId: string;
  documentId: string;
  documentTitle: string;
}

export default function Editor({ projectId, documentId, documentTitle }: EditorProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // 1. Create a local Y.Doc
    const doc = new Y.Doc();
    setYdoc(doc);

    // 2. Connect to the WebSocket gateway
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const socketClient = io(backendUrl, {
      transports: ['websocket'],
    });

    setSocket(socketClient);

    socketClient.on('connect', () => {
      setConnected(true);
      console.log('Connected to collaboration gateway');
    });

    socketClient.on('disconnect', () => {
      setConnected(false);
    });

    // 3. Bind Y.Doc and SocketClient with our custom provider
    const collabProvider = new SocketIOProvider(socketClient, doc, documentId);
    setProvider(collabProvider);

    // Cleanup on unmount
    return () => {
      collabProvider.destroy();
      socketClient.disconnect();
      doc.destroy();
    };
  }, [documentId]);

  // Configure Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable history because Collaboration handles state merge history
        history: false,
      }),
      Collaboration.configure({
        document: ydoc || new Y.Doc(),
        field: 'content',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none max-w-full min-h-[500px] text-gray-200 leading-relaxed text-lg',
      },
    },
  }, [ydoc]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-gray-400">
        Initializing Scriptora workspace...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#121214] border border-[#202024] rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1e] border-b border-[#202024]">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Style Controls */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('bold') ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('italic') ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('strike') ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>

          <div className="w-px h-6 bg-[#282830] mx-1" />

          {/* Heading Controls */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>

          <div className="w-px h-6 bg-[#282830] mx-1" />

          {/* Block Controls */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('bulletList') ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('orderedList') ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-[#282830] transition-colors ${editor.isActive('codeBlock') ? 'text-violet-400 bg-[#282830]' : 'text-gray-400'}`}
            title="Code Block"
          >
            <Code size={16} />
          </button>

          <div className="w-px h-6 bg-[#282830] mx-1" />

          {/* Undo/Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-[#282830] transition-colors text-gray-400"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-[#282830] transition-colors text-gray-400"
            title="Redo"
          >
            <Redo size={16} />
          </button>
        </div>

        {/* Connection Status & AI Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
            <span className="text-xs text-gray-400">{connected ? 'Synced' : 'Offline'}</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-violet-900/20 transition-all">
            <Sparkles size={12} />
            <span>AI Draft</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6 border-b border-[#202024] pb-4">
            {documentTitle}
          </h1>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
