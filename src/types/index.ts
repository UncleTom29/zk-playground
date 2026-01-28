// Re-export types from stores
export type { CompileResult, CircuitABI, ABIParameter, ABIType } from '@/stores/compilerStore';
export type { ProofInput, ProofResult, VerificationResult } from '@/stores/proverStore';
export type { DeploymentResult, DeploymentNetwork, OnChainVerificationResult } from '@/stores/deploymentStore';

// Circuit types
export interface Circuit {
  id: string;
  name: string;
  code: string;
  bytecode?: Uint8Array;
  abi?: import('@/stores/compilerStore').CircuitABI;
  createdAt: number;
  updatedAt: number;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: Difficulty;
  code: string;
  sampleInputs: Record<string, unknown>;
  tags: string[];
}

export type TemplateCategory = 'basic' | 'cryptography' | 'privacy' | 'games' | 'defi';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Tutorial types
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown content
  starterCode: string;
  solution: string;
  challenge?: Challenge;
  hints: string[];
}

export interface Challenge {
  description: string;
  testCases: TestCase[];
  requirements: string[];
}

export interface TestCase {
  inputs: Record<string, unknown>;
  expectedOutput?: unknown;
  description: string;
  shouldPass: boolean;
}

// Shared circuit types
export interface SharedCircuit {
  cid: string;
  code: string;
  title: string;
  description: string;
  author: string;
  timestamp: number;
  tags: string[];
  bytecode?: Uint8Array;
  abi?: import('@/stores/compilerStore').CircuitABI;
}

// Gallery types
export interface GalleryCircuit extends SharedCircuit {
  views: number;
  likes: number;
}

// Tutorial progress types
export interface TutorialProgress {
  tutorialId: string;
  completedLessons: string[];
  currentLesson: string;
  startedAt: number;
  completedAt?: number;
}

// Editor types
export interface EditorFile {
  name: string;
  content: string;
  language: string;
}

// Wallet types
export interface WalletInfo {
  publicKey: string;
  balance: number;
  network: string;
}
