'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { RoomProvider, useRoom, useSelf, useStatus } from '@liveblocks/react/suspense';
import { ClientSideSuspense } from '@liveblocks/react';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import type { Room } from '@liveblocks/client';
import * as Y from 'yjs';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Loader2, Undo, Redo } from 'lucide-react';

interface TipTapEditorProps {
  value: string;
  onChange: (content: string) => void;
  roomId?: string;
}

const MenuBar = ({ editor, status }: { editor: Editor | null, status?: string }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-primary/20 p-2 bg-gray-50/50 rounded-t-lg">
      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-primary/10 transition-colors text-gray-500 disabled:opacity-30"
          type="button"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-primary/10 transition-colors text-gray-500 disabled:opacity-30"
          type="button"
        >
          <Redo className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-primary/20 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
          type="button"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
          type="button"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-primary/20 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
          type="button"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
          type="button"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-primary/20 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
          type="button"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
          type="button"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {status && (
        <div className="flex items-center gap-2">
          {status === 'connected' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Connected</span>
            </div>
          ) : status === 'live' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Syncing</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Offline</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ========================
// OFFLINE EDITOR
// ========================
const LocalEditor = ({ value, onChange }: { value: string, onChange: (c: string) => void }) => {
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-8 focus:outline-none min-h-[450px] text-black',
      },
    },
  });

  return (
    <div className="border border-primary/30 rounded-lg overflow-hidden flex flex-col bg-white min-h-[550px] shadow-sm">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto cursor-text bg-white" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// ========================
// YJS CACHE (Để tránh việc tạo lại doc/provider khi Suspense re-mount)
// ========================
const yjsCache = new Map<string, { doc: Y.Doc; provider: LiveblocksYjsProvider }>();

const getOrCreateYjs = (roomId: string, room: Room) => {
  if (!yjsCache.has(roomId)) {
    console.log(`[DEBUG-TIPTAP] Creating new Yjs Doc & Provider for room: ${roomId}`);
    const doc = new Y.Doc();
    const provider = new LiveblocksYjsProvider(room, doc);
    yjsCache.set(roomId, { doc, provider });
  }
  return yjsCache.get(roomId)!;
};

// ========================
// REALTIME EDITOR CORE
// ========================
const RealtimeEditorCore = ({ value, onChange, roomId }: { value: string, onChange: (c: string) => void, roomId: string }) => {
  const room = useRoom();
  const status = useStatus();
  
  // Lấy doc/provider từ cache dựa trên roomId
  const { doc, provider } = useMemo(() => getOrCreateYjs(roomId, room), [roomId, room]);

  useEffect(() => {
    console.log(`[DEBUG-TIPTAP] Core Rendered - Status: ${status}, Room: ${roomId}`);
  }, [status, roomId]);

  return <RealtimeEditorInner doc={doc} provider={provider} value={value} onChange={onChange} status={status} />;
};

const CURSOR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];

const RealtimeEditorInner = ({ 
  doc, 
  provider, 
  value, 
  onChange,
  status
}: { 
  doc: Y.Doc, 
  provider: LiveblocksYjsProvider, 
  value: string, 
  onChange: (c: string) => void,
  status: string
}) => {
  const self = useSelf();
  const userInfo = self?.info;
  const userColor = useMemo(() => CURSOR_COLORS[(self?.connectionId ?? 0) % CURSOR_COLORS.length], [self?.connectionId]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const extensions = useMemo(() => [
    StarterKit.configure({
      history: false,
    }),
    Collaboration.configure({
      document: doc,
      field: 'content',
    }),
    CollaborationCursor.configure({
      provider: provider,
      user: {
        name: userInfo?.name || 'Anonymous User',
        color: userColor,
      },
    }),
  ], [doc, provider, userInfo?.name, userColor]);

  const editor = useEditor({
    extensions,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-8 focus:outline-none min-h-[450px] text-black',
      },
    },
  });

  // Đồng bộ nội dung ban đầu nếu room trống
  useEffect(() => {
    if (editor && value && editor.isEmpty && status === 'connected') {
       const timer = setTimeout(() => {
         if (editor.isEmpty) {
           editor.commands.setContent(value);
         }
       }, 1000);
       return () => clearTimeout(timer);
    }
  }, [editor, value, status]);

  return (
    <div className="border border-primary/30 rounded-lg overflow-hidden flex flex-col bg-white min-h-[550px] shadow-sm">
      <MenuBar editor={editor} status={status} />
      <div className="flex-1 overflow-y-auto cursor-text bg-white" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ========================
// MAIN COMPONENT EXPORT
// ========================
export default function TipTapEditor({ value, onChange, roomId }: TipTapEditorProps) {
  if (roomId) {
    return (
      <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
        <ClientSideSuspense fallback={<div className="min-h-[550px] flex items-center justify-center border border-primary/20 rounded-lg bg-white"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
          <RealtimeEditorCore value={value} onChange={onChange} roomId={roomId} />
        </ClientSideSuspense>
      </RoomProvider>
    );
  }

  return <LocalEditor value={value} onChange={onChange} />;
}
