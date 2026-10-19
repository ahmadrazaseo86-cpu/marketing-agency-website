'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Minus,
  Maximize2,
  Minimize2,
  FileCode,
  Eye,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing or type / to choose a block...',
  minHeight = '420px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Sync external value with editor div if not focused / initialized
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
        updateCounts(value || '');
      }
    }
    setSourceValue(value || '');
  }, [value, isSourceMode]);

  const updateCounts = (content: string) => {
    const text = content.replace(/<[^>]*>/g, ' ').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      updateCounts(html);
      onChange(html);
      setSourceValue(html);
    }
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    if (isSourceMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const setHeading = (tag: string) => {
    if (isSourceMode) return;
    editorRef.current?.focus();
    if (tag === 'p') {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
    handleInput();
  };

  const handleAddLink = () => {
    if (isSourceMode) return;
    const url = prompt('Enter URL (e.g. https://example.com):');
    if (url) {
      exec('createLink', url);
    }
  };

  const handleAddImage = () => {
    if (isSourceMode) return;
    const url = prompt('Enter Image URL:');
    if (url) {
      exec('insertImage', url);
    }
  };

  const handleInsertCode = () => {
    if (isSourceMode) return;
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      exec('insertHTML', `<code>${selection.toString()}</code>`);
    } else {
      exec('insertHTML', '<pre><code>// Enter code here</code></pre><p></p>');
    }
  };

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from raw HTML to Visual WYSIWYG
      setIsSourceMode(false);
      onChange(sourceValue);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = sourceValue;
          updateCounts(sourceValue);
        }
      }, 0);
    } else {
      // Switching from Visual WYSIWYG to raw HTML
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        setSourceValue(html);
        onChange(html);
      }
      setIsSourceMode(true);
    }
  };

  return (
    <div
      className={`border border-[#c3c4c7] rounded bg-white transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative'
      }`}
    >
      {/* Editor Header Bar with Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#c3c4c7] bg-[#f6f7f7] px-3 py-1.5 text-[#2c3338] select-none">
        {/* Mode switch tabs (Visual / Text) */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => isSourceMode && toggleSourceMode()}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x border-[#c3c4c7] -mb-[7px] bg-white ${
              !isSourceMode
                ? 'bg-white text-[#2271b1] border-b-2 border-b-white font-bold'
                : 'bg-transparent text-[#646970] border-transparent hover:text-[#1d2327]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Visual
            </span>
          </button>
          <button
            type="button"
            onClick={() => !isSourceMode && toggleSourceMode()}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x border-[#c3c4c7] -mb-[7px] ${
              isSourceMode
                ? 'bg-white text-[#2271b1] border-b-2 border-b-white font-bold'
                : 'bg-transparent text-[#646970] border-transparent hover:text-[#1d2327]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" /> Text (HTML)
            </span>
          </button>
        </div>

        {/* Fullscreen & Media shortcut */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Distraction-free Fullscreen'}
            className="p-1 hover:bg-[#e2e4e7] rounded text-[#646970] hover:text-[#1d2327]"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar (Active only in Visual mode) */}
      {!isSourceMode && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#f6f7f7] border-b border-[#dcdcde] text-xs">
          {/* Paragraph / Heading selector */}
          <select
            title="Format Block"
            onChange={(e) => setHeading(e.target.value)}
            defaultValue="p"
            className="h-7 px-2 border border-[#8c8f94] rounded text-xs bg-white text-[#2c3338] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <span className="w-px h-5 bg-[#c3c4c7] mx-1" />

          {/* Text Styling */}
          <button
            type="button"
            onClick={() => exec('bold')}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded hover:bg-[#e2e4e7] active:bg-[#d0d3d6] text-[#2c3338]"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded hover:bg-[#e2e4e7] active:bg-[#d0d3d6] text-[#2c3338]"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            title="Underline (Ctrl+U)"
            className="p-1.5 rounded hover:bg-[#e2e4e7] active:bg-[#d0d3d6] text-[#2c3338]"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            title="Strikethrough"
            className="p-1.5 rounded hover:bg-[#e2e4e7] active:bg-[#d0d3d6] text-[#2c3338]"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#c3c4c7] mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            title="Align Left"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            title="Align Center"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            title="Align Right"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            title="Justify"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#c3c4c7] mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="Bulleted List"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="Numbered List"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', 'blockquote')}
            title="Blockquote"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertCode}
            title="Code Block"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <Code className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#c3c4c7] mx-1" />

          {/* Links & Images */}
          <button
            type="button"
            onClick={handleAddLink}
            title="Insert/edit link"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('unlink')}
            title="Remove link"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <Unlink className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleAddImage}
            title="Insert Image by URL"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertHorizontalRule')}
            title="Horizontal Line"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#c3c4c7] mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => exec('undo')}
            title="Undo"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            title="Redo"
            className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#2c3338]"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`p-4 overflow-y-auto ${isFullscreen ? 'flex-1' : ''}`} style={{ minHeight }}>
        {isSourceMode ? (
          <textarea
            value={sourceValue}
            onChange={(e) => {
              setSourceValue(e.target.value);
              updateCounts(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Enter raw HTML code here..."
            className="w-full h-full min-h-[380px] font-mono text-xs p-3 border border-[#dcdcde] rounded outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] resize-y bg-[#fcfcfc] text-[#1d2327] leading-relaxed"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="prose max-w-none min-h-[380px] outline-none text-[#2c3338] text-sm leading-relaxed focus:ring-0 [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-[#2271b1] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#50575e] [&>blockquote]:my-4 [&>pre]:bg-[#2c3338] [&>pre]:text-[#f0f0f1] [&>pre]:p-3 [&>pre]:rounded [&>pre]:my-4 [&>pre]:overflow-x-auto [&>code]:bg-[#f0f0f1] [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs [&>img]:max-w-full [&>img]:h-auto [&>img]:rounded [&>img]:my-3 [&>hr]:my-4 [&>hr]:border-[#dcdcde]"
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[#646970] bg-[#f6f7f7] border-t border-[#dcdcde]">
        <div className="flex items-center gap-4">
          <span>
            Word count: <strong className="text-[#1d2327]">{wordCount}</strong>
          </span>
          <span>
            Characters: <strong className="text-[#1d2327]">{charCount}</strong>
          </span>
          <span>
            Reading time: ~{Math.max(1, Math.ceil(wordCount / 200))} min
          </span>
        </div>
        <div className="text-[11px] text-[#8c8f94]">
          {isSourceMode ? 'HTML Source Mode' : 'WYSIWYG Visual Mode'}
        </div>
      </div>
    </div>
  );
}
