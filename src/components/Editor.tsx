'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered } from 'lucide-react';
import clsx from 'clsx';
import { useEffect } from 'react';
// Needs extension for Underline as it's not in StarterKit by default
// But for simplicity, we can use an inline style or write a custom extension if tiptap/extension-underline isn't installed.
// Oh, we didn't install @tiptap/extension-underline. I will run npm install @tiptap/extension-underline in next step.
import Underline from '@tiptap/extension-underline';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      icon: <Bold size={18} />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold',
    },
    {
      icon: <Italic size={18} />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic',
    },
    {
      icon: <UnderlineIcon size={18} />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Underline',
    },
    {
      icon: <Heading1 size={18} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Heading 1',
    },
    {
      icon: <Heading2 size={18} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Heading 2',
    },
    {
      icon: <List size={18} />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List',
    },
    {
      icon: <ListOrdered size={18} />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Numbered List',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 bg-zinc-50 rounded-t-lg z-10">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          title={btn.title}
          className={clsx(
            'p-2 rounded-md hover:bg-zinc-200 transition-colors text-zinc-700',
            btn.isActive ? 'bg-zinc-200 text-zinc-900 font-semibold' : ''
          )}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

const extensions = [
  StarterKit,
  Underline,
];

export function Editor({ content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions,
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[500px] p-4 sm:p-6 cursor-text break-words',
      },
    },
  });

  // Failsafe: if the editor hydrates empty but we have content, force it in.
  // Also fixes issues where Fast Refresh clears the editor content.
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      editor.commands.setContent(content);
    }
  }, [editor]);

  return (
    <div className="border border-zinc-300 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      {editable && <MenuBar editor={editor} />}
      <div className="flex-1 overflow-y-auto bg-white cursor-text">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
