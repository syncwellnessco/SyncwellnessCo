"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Undo, Redo } from 'lucide-react';

interface EditorProps {
  data: string;
  onChange: (data: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnClass = (isActive: boolean) => 
    `p-2 rounded-md transition-colors ${isActive ? 'bg-[#8C6D40] text-white' : 'hover:bg-sage-100 text-charcoal/70'}`;

  return (
    <div className="border-b border-[#EBE3DB] bg-[#FAF8F5] p-2 flex flex-wrap gap-1 rounded-t-md sticky top-0 z-10">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))}><UnderlineIcon size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))}><Strikethrough size={16} /></button>
      <div className="w-px h-6 bg-[#EBE3DB] mx-1 my-auto" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}><Heading1 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))}><Heading2 size={16} /></button>
      <div className="w-px h-6 bg-[#EBE3DB] mx-1 my-auto" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}><Quote size={16} /></button>
      <div className="w-px h-6 bg-[#EBE3DB] mx-1 my-auto" />
      <button type="button" onClick={() => {
        const url = window.prompt('URL');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }} className={btnClass(editor.isActive('link'))}><LinkIcon size={16} /></button>
      <div className="w-px h-6 bg-[#EBE3DB] mx-1 my-auto" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}><Undo size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}><Redo size={16} /></button>
    </div>
  );
};

export default function Editor({ data, onChange }: EditorProps) {
  let initialContent = data;
  if (data && data.startsWith('{') && data.includes('"blocks"')) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.blocks) {
        initialContent = parsed.blocks.map((b: any) => `<p>${b.data?.text || ''}</p>`).join('');
      }
    } catch(e) {}
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sage max-w-none p-6 min-h-[400px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-[#EBE3DB] rounded-md bg-white overflow-hidden shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
