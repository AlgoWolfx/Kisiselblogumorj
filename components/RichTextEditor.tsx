'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { uploadImage } from '@/lib/supabase';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
  Palette,
  Type,
  PaintBucket
} from 'lucide-react';

interface RichTextEditorProps {
  userId: string;
  initialContent?: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Yazı boyutu eklentisi
const FontSize = TextStyle.configure({
  types: ['textStyle'],
});

const RichTextEditor = ({ userId, initialContent = '', onChange, placeholder = 'İçerik girin...' }: RichTextEditorProps) => {
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showLinkInput, setShowLinkInput] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showFontSizeOptions, setShowFontSizeOptions] = useState<boolean>(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const toggleCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  const setColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  const setBackgroundColor = (color: string) => {
    editor?.chain().focus().setMark('textStyle', { backgroundColor: color }).run();
  };

  const setFontSize = (size: string) => {
    editor?.chain().focus().setMark('textStyle', { fontSize: size }).run();
  };

  const setLink = () => {
    if (!linkUrl) return;
    
    // https:// ile başlıyorsa ekle, yoksa ekle
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    
    editor?.chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
    
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const unsetLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
    }
  };

  const handleSetHeading = (level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const handleUndo = () => {
    editor?.chain().focus().undo().run();
  };

  const handleRedo = () => {
    editor?.chain().focus().redo().run();
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, error } = await uploadImage(userId, file);
      
      if (error) {
        console.error('Dosya yükleme hatası:', error);
        return;
      }
      
      if (data?.publicUrl) {
        editor?.chain().focus().setImage({ src: data.publicUrl }).run();
      }
    } catch (error) {
      console.error('Görsel yükleme işlemi sırasında hata oluştu:', error);
    }
    
    // Input değerini temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!editor) {
    return null;
  }

  // Renk paleti
  const colors = [
    '#000000', // Siyah
    '#2563EB', // Mavi
    '#10B981', // Yeşil
    '#EF4444', // Kırmızı
    '#F59E0B', // Turuncu
    '#8B5CF6', // Mor
    '#EC4899', // Pembe
    '#6B7280', // Gri
  ];

  // Yazı boyutları
  const fontSizes = [
    { label: 'Küçük', value: '12px' },
    { label: 'Normal', value: '16px' },
    { label: 'Orta', value: '20px' },
    { label: 'Büyük', value: '24px' },
    { label: 'Çok Büyük', value: '30px' },
  ];

  return (
    <div className="rich-text-editor border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-300 dark:border-gray-700 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Kalın"
        >
          <Bold className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="İtalik"
        >
          <Italic className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={() => handleSetHeading(1)}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Başlık 1"
        >
          <Heading1 className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={() => handleSetHeading(2)}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Başlık 2"
        >
          <Heading2 className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={() => handleSetHeading(3)}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Başlık 3"
        >
          <Heading3 className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontSizeOptions(!showFontSizeOptions)}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
            title="Yazı Boyutu"
          >
            <Type className="h-5 w-5" />
          </button>
          
          {showFontSizeOptions && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 min-w-32">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => {
                    setFontSize(size.value);
                    setShowFontSizeOptions(false);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  style={{ fontSize: size.value }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Madde İşaretli Liste"
        >
          <List className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Numaralı Liste"
        >
          <ListOrdered className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={toggleCodeBlock}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Kod Bloğu"
        >
          <Code className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
            title="Metin Rengi"
          >
            <Palette className="h-5 w-5" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setColor(color);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
            title="Arkaplan Rengi"
          >
            <PaintBucket className="h-5 w-5" />
          </button>
          
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setBackgroundColor(color);
                      setShowBgColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
              editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Bağlantı"
          >
            <LinkIcon className="h-5 w-5" />
          </button>
          
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 flex">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="https://example.com"
                className="text-sm border border-gray-300 dark:border-gray-600 p-1 rounded dark:bg-gray-700"
                autoFocus
              />
              <div className="flex ml-2">
                <button 
                  onClick={setLink}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Ekle
                </button>
                {editor.isActive('link') && (
                  <button 
                    onClick={unsetLink}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs ml-1"
                  >
                    Kaldır
                  </button>
                )}
                <button 
                  onClick={() => setShowLinkInput(false)}
                  className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs ml-1"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleImageClick}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Görsel Ekle"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        
        <div className="ml-auto flex">
          <button
            type="button"
            onClick={handleUndo}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Geri Al"
            disabled={!editor.can().undo()}
          >
            <Undo className={`h-5 w-5 ${!editor.can().undo() ? 'opacity-50' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={handleRedo}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Yinele"
            disabled={!editor.can().redo()}
          >
            <Redo className={`h-5 w-5 ${!editor.can().redo() ? 'opacity-50' : ''}`} />
          </button>
        </div>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
      />
      <style jsx global>{`
        .ProseMirror p {
          margin: 1em 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.3em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .ProseMirror a {
          color: #2563EB;
          text-decoration: underline;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
        }
        .ProseMirror code {
          background-color: rgba(#616161, 0.1);
          color: #616161;
          font-family: monospace;
          border-radius: 0.25em;
          padding: 0.25em;
        }
        .ProseMirror pre {
          background: #0D0D0D;
          color: #FFF;
          font-family: monospace;
          padding: 0.75em 1em;
          border-radius: 0.5em;
        }
        .ProseMirror pre code {
          color: inherit;
          padding: 0;
          background: none;
          font-size: 0.8em;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid rgba(#0D0D0D, 0.1);
          margin: 2em 0;
        }
        .ProseMirror *[style*="color"] {
          display: inline-block;
        }
        .ProseMirror *[style*="background-color"] {
          display: inline-block;
          padding: 0 0.2em;
          border-radius: 0.2em;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 