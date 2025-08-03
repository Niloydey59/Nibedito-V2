'use client';

import { useEffect } from 'react';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

// Import dynamically to avoid SSR issues
const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then(mod => mod.default),
    { ssr: false }
);

export default function MarkdownEditor({ value, onChange, height = 300 }) {
    // Handle dark mode
    useEffect(() => {
        // Force light mode for the editor to ensure text visibility
        document.documentElement.setAttribute('data-color-mode', 'light');
        
        // Apply additional styles for better visibility
        const style = document.createElement('style');
        style.innerHTML = `
            .w-md-editor {
                background-color: #fff;
                color: #000;
            }
            .w-md-editor-text-input, .w-md-editor-text-pre {
                color: #333;
            }
            .w-md-editor-toolbar {
                background-color: #f5f5f5;
                border-bottom: 1px solid #ddd;
            }
            .w-md-editor-toolbar-divider {
                background-color: #ddd;
            }
            .w-md-editor-toolbar svg {
                color: #555;
            }
            .w-md-editor-preview {
                background-color: #f9f9f9;
                color: #333;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="markdown-editor-wrapper">
            <MDEditor
                value={value}
                onChange={onChange}
                height={height}
                preview="edit"
                className="custom-md-editor"
            />
        </div>
    );
} 