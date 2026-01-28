import { create } from 'zustand';

export type ProverStatus = 'idle' | 'generating' | 'verifying' | 'success' | 'error';

export interface ProofInput {
  [key: string]: string | number | boolean | ProofInput | ProofInput[];
}

export interface ProofResult {
  proof: Uint8Array;
  publicInputs: string[];
  verificationKey: Uint8Array;
  provingTime: number;
  proofSize: number;
}

export interface VerificationResult {
  isValid: boolean;
  verificationTime: number;
}

interface ProverState {
  // Status
  status: ProverStatus;
  setStatus: (status: ProverStatus) => void;

  // Inputs
  inputs: ProofInput;
  setInputs: (inputs: ProofInput) => void;
  setInput: (key: string, value: string | number | boolean) => void;
  clearInputs: () => void;

  // Proof result
  proofResult: ProofResult | null;
  setProofResult: (result: ProofResult | null) => void;

  // Verification
  verificationResult: VerificationResult | null;
  setVerificationResult: (result: VerificationResult | null) => void;

  // Progress
  isProving: boolean;
  provingProgress: number;
  setProvingProgress: (progress: number) => void;

  // Error
  error: string | null;
  setError: (error: string | null) => void;

  // Actions
  startProving: () => void;
  finishProving: (result: ProofResult) => void;
  failProving: (error: string) => void;
  startVerification: () => void;
  finishVerification: (result: VerificationResult) => void;
  reset: () => void;
}

export const useProverStore = create<ProverState>()((set) => ({
  // Initial state
  status: 'idle',
  inputs: {},
  proofResult: null,
  verificationResult: null,
  isProving: false,
  provingProgress: 0,
  error: null,

  // Setters
  setStatus: (status) => set({ status }),
  setInputs: (inputs) => set({ inputs }),
  setInput: (key, value) =>
    set((state) => ({
      inputs: { ...state.inputs, [key]: value },
    })),
  clearInputs: () => set({ inputs: {} }),
  setProofResult: (proofResult) => set({ proofResult }),
  setVerificationResult: (verificationResult) => set({ verificationResult }),
  setProvingProgress: (provingProgress) => set({ provingProgress }),
  setError: (error) => set({ error }),

  // Actions
  startProving: () =>
    set({
      status: 'generating',
      isProving: true,
      provingProgress: 0,
      error: null,
      proofResult: null,
      verificationResult: null,
    }),

  finishProving: (result) =>
    set({
      status: 'success',
      isProving: false,
      provingProgress: 100,
      proofResult: result,
      error: null,
    }),

  failProving: (error) =>
    set({
      status: 'error',
      isProving: false,
      provingProgress: 0,
      error,
      proofResult: null,
    }),

  startVerification: () =>
    set({
      status: 'verifying',
      verificationResult: null,
    }),

  finishVerification: (result) =>
    set({
      status: result.isValid ? 'success' : 'error',
      verificationResult: result,
    }),

  reset: () =>
    set({
      status: 'idle',
      inputs: {},
      proofResult: null,
      verificationResult: null,
      isProving: false,
      provingProgress: 0,
      error: null,
    }),
}));
