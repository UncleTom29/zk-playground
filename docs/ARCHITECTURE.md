# ZK-Playground Architecture

This document describes the technical architecture of ZK-Playground.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Next.js Application                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │   Monaco    │  │   React     │  │   Zustand   │      │   │
│  │  │   Editor    │  │ Components  │  │   Stores    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ Noir WASM   │  │ Barretenberg│  │  Web Worker │      │   │
│  │  │  Compiler   │  │   Prover    │  │   Runtime   │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Solana    │ │    IPFS     │ │  IndexedDB  │
    │  Blockchain │ │   Gateway   │ │   Storage   │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## Core Components

### 1. Monaco Editor

The code editor is built on Monaco (VS Code's editor):

```
src/components/editor/NoirEditor.tsx
src/lib/noir/noirLanguage.ts
```

**Features:**
- Custom Noir language definition
- Syntax highlighting
- Auto-completion
- Error markers
- Keyboard shortcuts

**Language Definition:**
```typescript
// Token types
keywords: ['fn', 'let', 'mut', 'pub', 'struct', ...]
types: ['Field', 'bool', 'u8', 'u16', ...]
builtins: ['assert', 'poseidon', 'pedersen', ...]
```

### 2. Compiler Service

WebAssembly-based Noir compilation:

```
src/lib/noir/compiler.ts
src/lib/noir/compiler.worker.ts
```

**Architecture:**
```
User Code → Worker Thread → Noir WASM → Bytecode + ABI
```

**Worker Communication (via Comlink):**
```typescript
interface CompilerWorker {
  compile(code: string): Promise<CompileResult>;
  getVersion(): Promise<string>;
}
```

### 3. Prover Service

Barretenberg-based proof generation:

```
src/lib/proving/prover.ts
src/lib/proving/prover.worker.ts
```

**Proof Flow:**
```
Bytecode + Inputs → Witness Generation → Proof Creation → Verification Key
```

### 4. Solana Integration

Deployment and verification:

```
src/lib/solana/sunspot.ts
src/lib/solana/walletProvider.tsx
```

**Deployment Process:**
1. Create verifier account
2. Store verification key
3. Confirm transaction
4. Return program ID

### 5. Storage Layer

Multiple storage backends:

```
src/lib/storage/ipfs.ts
```

**Hierarchy:**
```
1. In-memory cache (fastest)
2. IndexedDB (persistent)
3. IPFS (distributed)
```

## State Management

Zustand stores with persistence:

```
src/stores/
├── editorStore.ts     # Editor state, theme, settings
├── compilerStore.ts   # Compilation state, results
├── proverStore.ts     # Proof state, inputs
├── deploymentStore.ts # Solana deployment history
└── tutorialStore.ts   # Learning progress
```

**Store Pattern:**
```typescript
interface Store {
  // State
  data: Data;
  status: Status;

  // Actions
  setData: (data: Data) => void;
  reset: () => void;
}
```

## Data Flow

### Compilation Flow

```
1. User types code in editor
2. Editor triggers onChange
3. Code stored in editorStore
4. User clicks Compile
5. Code sent to Worker via Comlink
6. Worker initializes Noir WASM
7. WASM compiles code
8. Result returned to main thread
9. compilerStore updated
10. UI reflects compilation status
```

### Proof Generation Flow

```
1. User provides inputs
2. proverStore.startProving()
3. Barretenberg backend initialized
4. Witness generated from inputs
5. Proof created
6. Verification key extracted
7. proverStore.finishProving()
8. UI displays proof data
```

### Deployment Flow

```
1. User selects network
2. Wallet connection requested
3. Cost estimation calculated
4. User confirms deployment
5. Create account transaction built
6. User signs in wallet
7. Transaction submitted to Solana
8. Confirmation received
9. Program ID stored in deploymentStore
```

## Component Architecture

### Page Structure

```
app/
├── page.tsx              # Landing page
├── playground/
│   └── page.tsx          # Main IDE
├── templates/
│   └── page.tsx          # Template browser
├── learn/
│   ├── page.tsx          # Tutorial list
│   └── [tutorialId]/
│       └── page.tsx      # Tutorial player
├── gallery/
│   └── page.tsx          # Community circuits
└── share/
    └── [cid]/
        └── page.tsx      # Shared circuit viewer
```

### Component Hierarchy

```
PlaygroundPage
├── Toolbar
│   ├── CompileButton
│   ├── ProveButton
│   ├── DeployDropdown
│   └── ShareButton
├── Sidebar
│   ├── FileExplorer
│   ├── TemplateList
│   └── Settings
├── NoirEditor
│   └── Monaco
├── OutputPanel
│   ├── ConsoleTab
│   ├── BytecodeTab
│   ├── ABITab
│   ├── ProofTab
│   └── VerificationTab
└── StatusBar
```

## Security Considerations

### Client-Side Execution

- All compilation runs in browser
- Private inputs never leave the client
- Proofs generated locally

### Wallet Integration

- Standard wallet adapter
- User approval required
- Network selection visible

### IPFS Storage

- Content-addressed storage
- No private data in shared circuits
- CID verification

## Performance Optimizations

### Code Splitting

```typescript
// Dynamic imports for heavy components
const NoirEditor = dynamic(() => import('./NoirEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />
});
```

### Web Workers

```typescript
// Heavy computation off main thread
const worker = new Worker('./compiler.worker.ts');
const api = wrap<CompilerWorker>(worker);
```

### Caching

```typescript
// Circuit compilation cache
const cache = new Map<string, CompileResult>();
const cacheKey = hash(code);
if (cache.has(cacheKey)) return cache.get(cacheKey);
```

## Future Architecture

### Planned Improvements

1. **Multi-file Support** - Project structure with imports
2. **Debugging** - Step-through circuit execution
3. **Collaboration** - Real-time editing
4. **Backend API** - Server-side compilation option
5. **Mobile Support** - Responsive touch interface

### Scalability

- Edge caching for static assets
- CDN distribution
- Optional backend for heavy computation
