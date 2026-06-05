'use client';

import React, { useRef, useEffect, useState, useCallback, ClipboardEvent } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    name?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ name, defaultValue = '', value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [hiddenValue, setHiddenValue] = useState(() => {
        return value !== undefined ? value : defaultValue;
    });
    const initializedRef = useRef(false);

    useEffect(() => {
        if (editorRef.current && !initializedRef.current) {
            const initialValue = value !== undefined ? value : defaultValue;
            if (initialValue) {
                editorRef.current.innerHTML = initialValue;
                setHiddenValue(initialValue);
            }
            initializedRef.current = true;
        }
    }, [defaultValue, value]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            // Normalize empty contenteditable (browsers add <br> or &nbsp;)
            const cleaned = html === '<br>' || html === '<div><br></div>' ? '' : html;
            setHiddenValue(cleaned);
            if (onChange) {
                onChange(cleaned);
            }
        }
    }, [onChange]);

    const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        if (!text) return;

        const currentContent = editorRef.current?.innerText?.trim() || '';
        
        let htmlToInsert = text.replace(/\n/g, '<br>');
        
        if (!currentContent && name === 'description') {
            // "description classique": first sentence bold and uppercase, followed by a line break
            const match = text.match(/^([^.!?\n]+(?:[.!?]|\n|$))([\s\S]*)$/);
            if (match) {
                let firstSentence = match[1].trim().toUpperCase();
                let rest = match[2].trim();
                
                htmlToInsert = `<b>${firstSentence}</b><br><br>${rest ? rest.replace(/\n/g, '<br>') : ''}`;
            }
        }

        document.execCommand('insertHTML', false, htmlToInsert);
        handleInput();
    }, [handleInput, name]);

    const formatText = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        handleInput();
    };

    return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-500/20 transition-all">
            {name && <input type="hidden" name={name} value={hiddenValue} readOnly />}
            <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-white">
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); formatText('bold'); }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Gras"
                >
                    <Bold size={16} strokeWidth={2.5} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); formatText('italic'); }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Italique"
                >
                    <Italic size={16} strokeWidth={2.5} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); formatText('underline'); }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Souligné"
                >
                    <Underline size={16} strokeWidth={2.5} />
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                onPaste={handlePaste}
                className="w-full px-5 py-4 min-h-[140px] max-h-[400px] overflow-y-auto font-medium leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 [&>b]:font-bold [&>strong]:font-bold [&>i]:italic [&>em]:italic [&>u]:underline [&>div]:mb-2 [&>p]:mb-2"
                data-placeholder={placeholder}
            />
        </div>
    );
}
