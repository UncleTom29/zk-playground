'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Editor, { OnMount, BeforeMount, loader } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import {
  registerNoirLanguage,
  NOIR_LANGUAGE_ID,
} from '@/lib/noir/noirLanguage';

interface NoirEditorProps {
  code: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  errors?: CompilerError[];
  onCompile?: () => void;
  onProve?: () => void;
}

export interface CompilerError {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const DEFAULT_CODE = `// Welcome to ZK-Playground!
// Write your Noir circuit below

fn main(x: pub Field, y: Field) {
    // Prove that we know y such that x = y * y
    assert(x == y * y);
}
`;

export default function NoirEditor({
  code,
  onChange,
  theme = 'dark',
  readOnly = false,
  errors = [],
  onCompile,
  onProve,
}: NoirEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Monaco loader to use bundled Monaco
  useEffect(() => {
    loader.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
      },
    });
  }, []);

  // Register Noir language before editor mounts
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monacoRef.current = monaco;
    registerNoirLanguage(monaco);
  }, []);

  // Handle editor mount
  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      setIsLoading(false);

      // Configure editor options
      editor.updateOptions({
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: true },
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on',
        folding: true,
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
      });

      // Add keyboard shortcuts
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
        () => {
          onCompile?.();
        }
      );

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP,
        () => {
          onProve?.();
        }
      );

      // Add save shortcut (Ctrl/Cmd + S)
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {
          // Prevent default browser save
          // Could trigger auto-save here
        }
      );
    },
    [onCompile, onProve]
  );

  // Update error markers when errors change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Convert our errors to Monaco markers
    const markers: Monaco.editor.IMarkerData[] = errors.map((error) => ({
      severity:
        error.severity === 'error'
          ? monaco.MarkerSeverity.Error
          : error.severity === 'warning'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
      message: error.message,
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.endLine || error.line,
      endColumn: error.endColumn || error.column + 1,
    }));

    monaco.editor.setModelMarkers(model, 'noir-compiler', markers);
  }, [errors]);

  // Handle code changes
  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange(value || '');
    },
    [onChange]
  );

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Loading editor...
            </span>
          </div>
        </div>
      )}
      <Editor
        height="100%"
        width="100%"
        defaultLanguage={NOIR_LANGUAGE_ID}
        value={code || DEFAULT_CODE}
        theme={theme === 'dark' ? 'noir-dark' : 'noir-light'}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{
          readOnly,
          domReadOnly: readOnly,
        }}
        loading={null}
      />
    </div>
  );
}
