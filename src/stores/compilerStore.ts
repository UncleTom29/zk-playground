import { create } from 'zustand';
import type { CompilerError } from '@/components/editor/NoirEditor';

export type CompileStatus = 'idle' | 'compiling' | 'success' | 'error';

export interface CompileResult {
  bytecode: Uint8Array;
  abi: CircuitABI;
  compileTime: number;
  warnings: string[];
}

export interface CircuitABI {
  parameters: ABIParameter[];
  param_witnesses: Record<string, number[]>;
  return_type: ABIType | null;
  return_witnesses: number[];
  error_types: Record<string, ABIType>;
}

export interface ABIParameter {
  name: string;
  type: ABIType;
  visibility: 'public' | 'private';
}

export interface ABIType {
  kind: 'field' | 'boolean' | 'integer' | 'string' | 'array' | 'tuple' | 'struct';
  sign?: 'unsigned' | 'signed';
  width?: number;
  length?: number;
  fields?: ABIParameter[];
  path?: string;
}

interface CompilerState {
  // Status
  status: CompileStatus;
  setStatus: (status: CompileStatus) => void;

  // Compile result
  compileResult: CompileResult | null;
  setCompileResult: (result: CompileResult | null) => void;

  // Errors
  errors: CompilerError[];
  setErrors: (errors: CompilerError[]) => void;
  addError: (error: CompilerError) => void;
  clearErrors: () => void;

  // Warnings
  warnings: string[];
  setWarnings: (warnings: string[]) => void;

  // Progress
  isCompiling: boolean;
  compileProgress: number;
  setCompileProgress: (progress: number) => void;

  // Actions
  startCompile: () => void;
  finishCompile: (result: CompileResult) => void;
  failCompile: (errors: CompilerError[]) => void;
  reset: () => void;
}

export const useCompilerStore = create<CompilerState>()((set) => ({
  // Initial state
  status: 'idle',
  compileResult: null,
  errors: [],
  warnings: [],
  isCompiling: false,
  compileProgress: 0,

  // Setters
  setStatus: (status) => set({ status }),
  setCompileResult: (compileResult) => set({ compileResult }),
  setErrors: (errors) => set({ errors }),
  addError: (error) => set((state) => ({ errors: [...state.errors, error] })),
  clearErrors: () => set({ errors: [] }),
  setWarnings: (warnings) => set({ warnings }),
  setCompileProgress: (compileProgress) => set({ compileProgress }),

  // Actions
  startCompile: () =>
    set({
      status: 'compiling',
      isCompiling: true,
      compileProgress: 0,
      errors: [],
      warnings: [],
    }),

  finishCompile: (result) =>
    set({
      status: 'success',
      isCompiling: false,
      compileProgress: 100,
      compileResult: result,
      warnings: result.warnings,
    }),

  failCompile: (errors) =>
    set({
      status: 'error',
      isCompiling: false,
      compileProgress: 0,
      errors,
      compileResult: null,
    }),

  reset: () =>
    set({
      status: 'idle',
      compileResult: null,
      errors: [],
      warnings: [],
      isCompiling: false,
      compileProgress: 0,
    }),
}));
