"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { getTextDirection } from "@/lib/text-direction";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
  Languages,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TipTapEditorProps = {
  content: string;
  onChange: (content: string) => void;
  locale: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
};

// Create a plugin key for RTL detection
const rtlPluginKey = new PluginKey('rtl_detection');

// Custom extension with plugin to handle RTL direction
const RTLDirection = Extension.create({
  name: 'rtlDirection',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          dir: {
            default: null,
            parseHTML: element => element.getAttribute('dir'),
            renderHTML: attributes => {
              if (!attributes.dir) {
                return {};
              }
              return {
                dir: attributes.dir,
              };
            },
          },
        },
      },
    ];
  },

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addKeyboardShortcuts() {
    return {};
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: rtlPluginKey,
        appendTransaction: (transactions, oldState, newState) => {
          // Don't apply if this is a document update (not user typing)
          const isDocUpdate = transactions.some(tr => tr.docChanged);
          if (!isDocUpdate) return null;

          // Check if any transaction was triggered by our plugin to prevent loops
          const isFromPlugin = transactions.some(tr => tr.getMeta(rtlPluginKey));
          if (isFromPlugin) return null;

          const tr = newState.tr;
          let modified = false;

          // Check each paragraph and heading node
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'paragraph' || node.type.name === 'heading') {
              const text = node.textContent;
              const currentDir = node.attrs.dir;

              // Detect direction: RTL if first 3+ chars are RTL
              let newDir = null;
              if (text.length >= 3) {
                const firstThree = text.slice(0, 3);
                const firstThreeDirection = getTextDirection(firstThree);
                if (firstThreeDirection === 'rtl') {
                  newDir = 'rtl';
                }
              } else if (text.length > 0) {
                const direction = getTextDirection(text);
                if (direction === 'rtl') {
                  newDir = 'rtl';
                }
              }

              // Only update if direction changed
              if (newDir !== currentDir) {
                tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  dir: newDir,
                });
                modified = true;
              }
            }
          });

          // Mark this transaction as coming from our plugin
          if (modified) {
            tr.setMeta(rtlPluginKey, true);
            return tr;
          }

          return null;
        },
      }),
    ];
  },
});

function ToolbarButton({
  onClick,
  disabled,
  isActive,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
      className={`p-2 rounded transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function MenuBar({
  editor,
}: {
  editor: Editor | null;
}) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Other */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          isActive={false}
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export default function TipTapEditor({
  content,
  onChange,
  locale,
}: TipTapEditorProps) {
  const [isRTL, setIsRTL] = useState(false);
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      RTLDirection,
      StarterKit.configure({
        document: false,
        paragraph: false,
        text: false,
        heading: false,
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-inside",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-inside",
          },
        },
        link: false,
        underline: false,
      }),
      Document.configure({
        content: 'block+',
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: 'my-1',
        },
      }),
      Text.configure({
        whitespace: 'pre', // Preserve whitespace including trailing spaces
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline dark:text-blue-400",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3",
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return;

      const html = editor.getHTML();
      if (html !== lastContentRef.current) {
        lastContentRef.current = html;
        onChange(html);
      }

      // Check if any RTL content exists for UI indicator
      let hasRTL = false;
      editor.state.doc.descendants((node) => {
        if ((node.type.name === 'paragraph' || node.type.name === 'heading') && node.attrs.dir === 'rtl') {
          hasRTL = true;
        }
      });
      setIsRTL(hasRTL);
    },
  });

  // Sync editor content when prop changes (but not on every onChange)
  useEffect(() => {
    if (!editor) return;

    // Only update if content is different from what we last sent
    if (content !== lastContentRef.current) {
      isUpdatingRef.current = true;
      editor.commands.setContent(content, false);
      lastContentRef.current = content;

      // Reset flag after update
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        <span>{isRTL ? "RTL" : "LTR"} detected</span>
        <div className="flex items-center gap-1">
          <Languages className="w-3 h-3" />
          <span>{locale.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
