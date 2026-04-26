'use client';

import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    name: string;
    defaultValue?: string;
    placeholder?: string;
}

export function RichTextEditor({ name, defaultValue = '', placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editorRef.current && defaultValue) {
            editorRef.current.innerHTML = defaultValue;
            if (inputRef.current) {
                inputRef.current.value = defaultValue;
            }
        }
    }, [defaultValue]);

    const handleInput = () => {
        if (editorRef.current && inputRef.current) {
            inputRef.current.value = editorRef.current.innerHTML;
        }
    };

    const formatText = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        handleInput();
    };

    return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-500/20 transition-all">
            <input type="hidden" name={name} ref={inputRef} defaultValue={defaultValue} />
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
                className="w-full px-5 py-4 min-h-[140px] max-h-[400px] overflow-y-auto font-medium leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 [&>b]:font-bold [&>strong]:font-bold [&>i]:italic [&>em]:italic [&>u]:underline [&>div]:mb-2 [&>p]:mb-2"
                data-placeholder={placeholder}
            />
        </div>
    );
}
