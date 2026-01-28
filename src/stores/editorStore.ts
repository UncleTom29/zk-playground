import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface EditorState {
  // Code
  code: string;
  setCode: (code: string) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Editor settings
  fontSize: number;
  setFontSize: (size: number) => void;
  minimap: boolean;
  setMinimap: (show: boolean) => void;
  wordWrap: boolean;
  setWordWrap: (wrap: boolean) => void;

  // File state
  currentFileName: string;
  setCurrentFileName: (name: string) => void;
  isModified: boolean;
  setIsModified: (modified: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activePanel: 'files' | 'templates' | 'settings';
  setActivePanel: (panel: 'files' | 'templates' | 'settings') => void;

  // Reset
  reset: () => void;
}

const DEFAULT_CODE = `// Welcome to ZK-Playground!
// Write your Noir circuit below

fn main(x: pub Field, y: Field) {
    // Prove that we know y such that x = y * y
    assert(x == y * y);
}
`;

const initialState = {
  code: DEFAULT_CODE,
  theme: 'dark' as Theme,
  fontSize: 14,
  minimap: true,
  wordWrap: true,
  currentFileName: 'main.nr',
  isModified: false,
  sidebarOpen: true,
  activePanel: 'files' as const,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...initialState,

      setCode: (code) => set({ code, isModified: true }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setMinimap: (minimap) => set({ minimap }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setCurrentFileName: (currentFileName) => set({ currentFileName }),
      setIsModified: (isModified) => set({ isModified }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setActivePanel: (activePanel) => set({ activePanel }),

      reset: () => set(initialState),
    }),
    {
      name: 'zk-playground-editor',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        code: state.code,
        theme: state.theme,
        fontSize: state.fontSize,
        minimap: state.minimap,
        wordWrap: state.wordWrap,
        currentFileName: state.currentFileName,
      }),
    }
  )
);
