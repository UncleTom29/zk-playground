# ZK-Playground

[![CI](https://github.com/UncleTom29/zk-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/UncleTom29/zk-playground/actions/workflows/ci.yml)
[![Deploy](https://github.com/UncleTom29/zk-playground/actions/workflows/deploy.yml/badge.svg)](https://github.com/UncleTom29/zk-playground/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive browser-based environment for learning and testing Zero-Knowledge circuits with Noir, featuring live deployment to Solana.

![ZK-Playground Screenshot](docs/screenshot.png)

## Features

### Core Features

- **Monaco Editor** - VS Code-powered editor with Noir syntax highlighting, auto-completion, and error markers
- **In-Browser Compilation** - Compile Noir circuits directly in your browser using WebAssembly
- **Proof Generation** - Generate Zero-Knowledge proofs using Barretenberg
- **One-Click Deploy** - Deploy verifiers to Solana devnet/mainnet using Sunspot

### Learning & Templates

- **Interactive Tutorials** - Learn ZK proofs step-by-step with guided lessons, challenges, and hints
- **Circuit Templates** - 17+ pre-built templates for common ZK use cases across 5 categories
- **Progress Tracking** - Track your learning progress with persistent state

### Collaboration

- **Share via IPFS** - Share circuits via decentralized storage
- **Community Gallery** - Browse and import circuits shared by others
- **Import/Export** - Easy circuit sharing with unique URLs

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14 with App Router |
| **Language** | TypeScript (strict mode) |
| **Styling** | TailwindCSS + shadcn/ui |
| **Editor** | Monaco Editor |
| **ZK** | Noir WASM, Barretenberg |
| **Blockchain** | Solana Web3.js, Wallet Adapter |
| **State** | Zustand with persistence |
| **Storage** | IndexedDB, IPFS (Infura) |
| **Testing** | Jest, React Testing Library, Playwright |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/UncleTom29/zk-playground.git
cd zk-playground
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory (see `.env.example`):

```env
# IPFS (Infura) - Required for sharing
NEXT_PUBLIC_INFURA_PROJECT_ID=your_project_id
NEXT_PUBLIC_INFURA_PROJECT_SECRET=your_project_secret

# Solana - Required for deployment
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
│   ├── /app                    # Next.js pages and API routes
│   │   ├── /playground         # Main IDE page
│   │   ├── /templates          # Circuit templates browser
│   │   ├── /learn              # Tutorials and learning
│   │   │   └── /[tutorialId]   # Individual tutorial player
│   │   ├── /gallery            # Community circuits gallery
│   │   ├── /share/[cid]        # Shared circuit viewer
│   │   └── /api                # API routes
│   │       └── /gallery        # Gallery REST API
│   ├── /components
│   │   ├── /editor             # Monaco editor components
│   │   ├── /deployment         # Solana deployment wizard
│   │   ├── /tutorials          # Tutorial player components
│   │   ├── /templates          # Template browser components
│   │   ├── /sharing            # Share dialog components
│   │   ├── /layout             # Layout components
│   │   └── /ui                 # shadcn/ui base components
│   ├── /lib
│   │   ├── /noir               # Noir compiler wrapper
│   │   ├── /proving            # Barretenberg integration
│   │   ├── /solana             # Web3 + wallet adapter
│   │   ├── /storage            # IndexedDB + IPFS services
│   │   ├── /tutorials          # Tutorial data and test runner
│   │   └── /templates          # Template library
│   ├── /stores                 # Zustand state management
│   └── /types                  # TypeScript type definitions
├── /docs                       # Documentation
├── /tests
│   ├── /unit                   # Jest unit tests
│   └── /e2e                    # Playwright E2E tests
└── /.github
    └── /workflows              # CI/CD pipelines
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
| `Ctrl+S` | Save to browser |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find and replace |

### Templates

Browse 17+ pre-built templates in the Templates section:

**Basic**
- Hello World (simple square proof)
- Age Verification
- Range Proof

**Cryptography**
- Hash Preimage
- Signature Verification
- Poseidon Hash

**Privacy**
- Merkle Membership
- Private Voting
- Credential Proof

**Games**
- Sudoku Verifier
- Battleship
- Guess the Number

**DeFi**
- Private Balance
- Anonymous Transfer

### Tutorials

Interactive tutorials available in the Learn section:

1. **Introduction to ZK Proofs** (Beginner, ~30 min)
   - What are ZK proofs?
   - Public vs private inputs
   - Writing constraints

2. **Merkle Trees & Privacy** (Intermediate, ~45 min)
   - Understanding Merkle trees
   - Membership proofs
   - Privacy applications

3. **Cryptographic Hash Functions** (Intermediate, ~40 min)
   - ZK-friendly hashes
   - Preimage proofs
   - Hash chains

### Deploying to Solana

1. Connect your wallet (Phantom, Backpack, or Solflare)
2. Compile your circuit
3. Generate a proof
4. Click "Deploy" and follow the wizard
5. Select network (Devnet recommended for testing)
6. Review and confirm the transaction

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:headed  # Run E2E tests in headed mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run type-check       # Run TypeScript type checking
```

### Running Tests

```bash
# Unit tests with Jest
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e

# E2E tests with interactive UI
npm run test:e2e:ui
```

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npm run type-check
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

The GitHub Actions workflow automatically deploys to Vercel on push to `main`.

### Manual Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t zk-playground .
docker run -p 3000:3000 zk-playground
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): description    # New feature
fix(scope): description     # Bug fix
docs(scope): description    # Documentation
test(scope): description    # Tests
refactor(scope): description # Refactoring
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) - How to use ZK-Playground
- [Architecture](docs/ARCHITECTURE.md) - Technical architecture
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

## Resources

- [Noir Language Documentation](https://noir-lang.org/docs)
- [Barretenberg](https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Aztec Protocol](https://aztec.network/) for Noir and Barretenberg
- [Solana Foundation](https://solana.foundation/) for the blockchain infrastructure
- [Microsoft](https://microsoft.com/) for Monaco Editor
- [Vercel](https://vercel.com/) for hosting
