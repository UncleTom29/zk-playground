# ZK-Playground

An interactive browser-based environment for learning and testing Zero-Knowledge circuits with Noir, featuring live deployment to Solana.

## Features

- **Monaco Editor** - VS Code-powered editor with Noir syntax highlighting, auto-completion, and error markers
- **In-Browser Compilation** - Compile Noir circuits directly in your browser using WebAssembly
- **Proof Generation** - Generate Zero-Knowledge proofs using Barretenberg
- **One-Click Deploy** - Deploy verifiers to Solana devnet/mainnet using Sunspot
- **Interactive Tutorials** - Learn ZK proofs step-by-step with guided lessons
- **Circuit Templates** - Pre-built templates for common ZK use cases
- **Share & Collaborate** - Share circuits via IPFS and browse community gallery

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **Editor**: Monaco Editor
- **ZK**: Noir WASM, Barretenberg
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **State**: Zustand + Jotai
- **Storage**: IndexedDB, IPFS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/zk-playground.git
cd zk-playground
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# IPFS (Infura)
NEXT_PUBLIC_INFURA_PROJECT_ID=your_project_id
NEXT_PUBLIC_INFURA_PROJECT_SECRET=your_project_secret

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_key

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your_domain

# Error tracking (optional)
SENTRY_DSN=your_sentry_dsn
```

## Project Structure

```
/zk-playground
├── /src
│   ├── /app
│   │   ├── /playground      # Main IDE
│   │   ├── /templates       # Circuit templates
│   │   ├── /learn           # Tutorials
│   │   ├── /gallery         # Community circuits
│   │   └── /share/[cid]     # Shared circuits
│   ├── /components
│   │   ├── /editor          # Monaco editor
│   │   ├── /compiler        # Compilation UI
│   │   ├── /prover          # Proof generation
│   │   ├── /deployment      # Solana deployment
│   │   ├── /layout          # Layout components
│   │   └── /ui              # shadcn/ui components
│   ├── /lib
│   │   ├── /noir            # Noir compiler wrapper
│   │   ├── /proving         # Barretenberg integration
│   │   ├── /solana          # Web3 + wallet
│   │   ├── /storage         # IndexedDB + IPFS
│   │   └── /tutorials       # Tutorial data
│   ├── /hooks               # React hooks
│   ├── /stores              # Zustand stores
│   └── /types               # TypeScript types
├── /public
│   ├── /templates           # Template files
│   └── /wasm                # WASM modules
└── /tests
    ├── /unit
    ├── /integration
    └── /e2e
```

## Usage

### Writing Circuits

```noir
fn main(x: pub Field, y: Field) {
    // Prove that we know y such that x = y * y
    assert(x == y * y);
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Compile circuit |
| `Ctrl+P` | Generate proof |
| `Ctrl+S` | Save (auto-save enabled) |

### Templates

Browse pre-built templates in the Templates section:
- Hello World (simple square proof)
- Age Verification
- Hash Preimage
- Merkle Membership
- Private Voting
- And more...

### Tutorials

Interactive tutorials available in the Learn section:
1. **Introduction to ZK Proofs** (Beginner)
2. **Merkle Trees & Privacy** (Intermediate)
3. **Cryptographic Hash Functions** (Intermediate)

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker

```bash
docker build -t zk-playground .
docker run -p 3000:3000 zk-playground
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

- [Noir Language Documentation](https://noir-lang.org/docs)
- [Barretenberg](https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Aztec Protocol](https://aztec.network/) for Noir and Barretenberg
- [Solana Foundation](https://solana.foundation/) for the blockchain infrastructure
- [Microsoft](https://microsoft.com/) for Monaco Editor
