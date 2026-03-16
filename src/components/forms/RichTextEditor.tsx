import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useCallback, useState, useRef } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    singleLine?: boolean;
    className?: string;
    onEnter?: () => void;
}

export function RichTextEditor({ value, onChange, placeholder, singleLine = false, className = '', onEnter }: RichTextEditorProps) {
    const [showBubble, setShowBubble] = useState(false);
    const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
                hardBreak: singleLine ? false : undefined,
                bulletList: singleLine ? false : undefined,
                orderedList: singleLine ? false : undefined,
                listItem: singleLine ? false : undefined,
                // Link & Underline are included by StarterKit v3 — no need to add separately
                link: { openOnClick: false, HTMLAttributes: { class: 'rte-link' } },
            }),
        ],
        editorProps: {
            attributes: {
                class: `rte-content ${singleLine ? 'rte-single-line' : ''}`,
                'data-placeholder': placeholder || '',
            },
            handleKeyDown: (_view, event) => {
                if (event.key === 'Enter' && singleLine) {
                    event.preventDefault();
                    if (onEnter) onEnter();
                    return true;
                }
                return false;
            },
        },
        content: value || '',
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            const cleaned = html === '<p></p>' ? '' : html;
            onChange(cleaned);
        },
        onSelectionUpdate: ({ editor: ed }) => {
            const { from, to } = ed.state.selection;
            if (from === to) {
                setShowBubble(false);
                return;
            }
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                // Use viewport coords (fixed positioning)
                setBubblePos({
                    top: rect.top - 40,
                    left: rect.left + rect.width / 2,
                });
            }
            setShowBubble(true);
        },
        onBlur: () => {
            setTimeout(() => setShowBubble(false), 200);
        },

    });

    // Sync external value changes
    useEffect(() => {
        if (!editor) return;
        const currentHtml = editor.getHTML();
        const normalizedCurrent = currentHtml === '<p></p>' ? '' : currentHtml;
        const normalizedValue = value || '';
        if (normalizedCurrent !== normalizedValue) {
            editor.commands.setContent(normalizedValue || '', { emitUpdate: false });
        }
    }, [value, editor]);

    const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
    const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
    const toggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
    const toggleStrike = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL', previousUrl || 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <div ref={wrapperRef} className={`rte-wrapper ${singleLine ? 'rte-single' : ''} ${className}`}>
            {/* Floating bubble menu — only in singleLine mode (no fixed toolbar) */}
            {singleLine && showBubble && (
                <div className="rte-bubble-menu" style={{ position: 'fixed', top: bubblePos.top, left: bubblePos.left }}>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); toggleBold(); }} className={editor.isActive('bold') ? 'is-active' : ''} title="Bold (Ctrl+B)">
                        <strong>B</strong>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); toggleItalic(); }} className={editor.isActive('italic') ? 'is-active' : ''} title="Italic (Ctrl+I)">
                        <em>I</em>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); toggleUnderline(); }} className={editor.isActive('underline') ? 'is-active' : ''} title="Underline (Ctrl+U)">
                        <u>U</u>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); toggleStrike(); }} className={editor.isActive('strike') ? 'is-active' : ''} title="Strikethrough">
                        <s>S</s>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); setLink(); }} className={editor.isActive('link') ? 'is-active' : ''} title="Link (Ctrl+K)">
                        🔗
                    </button>
                </div>
            )}

            {/* Fixed toolbar (non-singleLine mode) */}
            {!singleLine && (
                <div className="rte-toolbar">
                    <button type="button" onClick={toggleBold} className={editor.isActive('bold') ? 'is-active' : ''} title="Bold">
                        <strong>B</strong>
                    </button>
                    <button type="button" onClick={toggleItalic} className={editor.isActive('italic') ? 'is-active' : ''} title="Italic">
                        <em>I</em>
                    </button>
                    <button type="button" onClick={toggleUnderline} className={editor.isActive('underline') ? 'is-active' : ''} title="Underline">
                        <u>U</u>
                    </button>
                    <button type="button" onClick={toggleStrike} className={editor.isActive('strike') ? 'is-active' : ''} title="Strikethrough">
                        <s>S</s>
                    </button>
                    <span className="rte-toolbar-divider" />
                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="Bullet List">
                        •
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} title="Numbered List">
                        1.
                    </button>
                    <span className="rte-toolbar-divider" />
                    <button type="button" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''} title="Insert Link">
                        🔗
                    </button>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}
