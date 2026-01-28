# ZK-Playground User Guide

Welcome to ZK-Playground! This guide will help you get started with writing, testing, and deploying Zero-Knowledge circuits.

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Playground Interface](#the-playground-interface)
3. [Writing Circuits](#writing-circuits)
4. [Compiling Circuits](#compiling-circuits)
5. [Generating Proofs](#generating-proofs)
6. [Deploying to Solana](#deploying-to-solana)
7. [Using Templates](#using-templates)
8. [Learning with Tutorials](#learning-with-tutorials)
9. [Sharing Circuits](#sharing-circuits)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Troubleshooting](#troubleshooting)

## Getting Started

### What is ZK-Playground?

ZK-Playground is a browser-based IDE for Zero-Knowledge circuits using the Noir programming language. You can:

- Write and edit Noir circuits with full syntax support
- Compile circuits directly in your browser
- Generate and verify ZK proofs
- Deploy verifiers to Solana blockchain
- Share circuits with the community

### Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- For deployment: A Solana wallet (Phantom, Backpack, or Solflare)

## The Playground Interface

### Layout Overview

```
+------------------+------------------------+
|     Toolbar      |                        |
+------------------+------------------------+
|      |           |                        |
| Side |  Editor   |                        |
| bar  |           |     Output Panel       |
|      |           |                        |
+------+-----------+------------------------+
|              Status Bar                   |
+-------------------------------------------+
```

### Toolbar

- **Compile** - Compile your circuit (Ctrl+B)
- **Prove** - Generate a proof (Ctrl+P)
- **Deploy** - Deploy to Solana
- **Share** - Share circuit via IPFS
- **Theme Toggle** - Switch between dark/light mode

### Sidebar

- **Files** - Manage circuit files
- **Templates** - Quick access to templates
- **Settings** - Editor preferences

### Editor

The Monaco-based editor provides:
- Noir syntax highlighting
- Auto-completion
- Error markers
- Find and replace

### Output Panel

Tabs for viewing:
- **Console** - Compilation logs and messages
- **Bytecode** - Compiled circuit bytecode
- **ABI** - Circuit interface definition
- **Proof** - Generated proof data
- **Verification** - Verification results

## Writing Circuits

### Basic Circuit Structure

```noir
fn main(x: Field, y: pub Field) {
    // x is private (known only to prover)
    // y is public (known to both prover and verifier)

    assert(x * x == y);
}
```

### Key Concepts

**Private Inputs** - Values known only to the prover (no `pub` keyword)

**Public Inputs** - Values visible to verifier (marked with `pub`)

**Constraints** - Assertions that must be satisfied

### Example: Age Verification

```noir
fn main(age: Field, min_age: pub Field) {
    // Prove age >= min_age without revealing actual age
    assert(age >= min_age);
}
```

## Compiling Circuits

1. Write your circuit in the editor
2. Click **Compile** or press `Ctrl+B`
3. View results in the Output Panel:
   - **Console** - Compilation status
   - **Bytecode** - Compiled circuit
   - **ABI** - Input/output specification

### Understanding Errors

Compilation errors appear:
- As red squiggles in the editor
- In the Console tab with details
- In the Status Bar count

Common errors:
- Missing `assert` statements
- Type mismatches
- Undefined variables

## Generating Proofs

### Prerequisites

- Successfully compiled circuit
- Input values for all parameters

### Steps

1. Compile your circuit first
2. Click **Prove** or press `Ctrl+P`
3. Enter input values in the form
4. Click **Generate Proof**
5. View proof in the **Proof** tab

### Proof Components

- **Proof** - Cryptographic proof data
- **Public Inputs** - Values visible to verifier
- **Verification Key** - For verifier setup

## Deploying to Solana

### Prerequisites

- Generated proof
- Connected Solana wallet
- SOL for transaction fees

### Deployment Steps

1. Click **Deploy** in the toolbar
2. Select network (Devnet recommended for testing)
3. Connect your wallet
4. Review estimated cost
5. Click **Deploy Verifier**
6. Confirm transaction in wallet

### After Deployment

You'll receive:
- **Program ID** - Your verifier's address
- **Transaction Signature** - Deployment proof
- Explorer links

### Verifying On-Chain

1. Click **Verify On-Chain**
2. Select your deployed verifier
3. Submit verification transaction
4. View result (Valid/Invalid)

## Using Templates

### Accessing Templates

1. Go to **Templates** page
2. Browse by category or search
3. Click on template to preview
4. Click **Use Template** to load

### Available Categories

- **Basic** - Simple circuits for learning
- **Cryptography** - Signature verification, hashes
- **Privacy** - Merkle proofs, anonymous actions
- **Games** - Puzzles and verification
- **DeFi** - Financial privacy circuits

### Template Features

Each template includes:
- Working circuit code
- Sample inputs
- Description and tags

## Learning with Tutorials

### Available Tutorials

1. **Introduction to ZK Proofs**
   - What are ZK proofs?
   - Public vs private inputs
   - Basic constraints

2. **Merkle Trees & Privacy**
   - Tree structure
   - Membership proofs
   - Privacy applications

3. **Hash Functions in ZK**
   - ZK-friendly hashes
   - Preimage proofs
   - Hash chains

### Tutorial Features

- Step-by-step lessons
- Interactive code editor
- Test your code
- Hints and solutions
- Progress tracking

## Sharing Circuits

### Creating a Share

1. Click **Share** in toolbar
2. Enter title and description
3. Add tags (comma-separated)
4. Click **Share**
5. Copy the share link

### What Gets Shared

- Circuit code
- Metadata (title, description, tags)
- Compilation data (optional)

### Viewing Shared Circuits

1. Open share link or browse Gallery
2. View code and metadata
3. Click **Import to Playground** to use

## Keyboard Shortcuts

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

## Troubleshooting

### Compilation Errors

**"Missing main function"**
- Ensure your circuit has `fn main(...) { }`

**"Type mismatch"**
- Check parameter types match usage
- Use `as` for type conversion

**"Undefined variable"**
- Declare variables before use
- Check spelling

### Proof Generation Issues

**"Missing inputs"**
- All parameters need values
- Check ABI for expected types

**"Constraint not satisfied"**
- Input values don't satisfy assertions
- Verify your logic

### Deployment Problems

**"Insufficient balance"**
- Get devnet SOL from a faucet
- Check wallet connection

**"Transaction failed"**
- Try again (network congestion)
- Check wallet approval

### Browser Issues

**"Editor not loading"**
- Refresh the page
- Try a different browser
- Clear browser cache

**"WASM error"**
- Enable WebAssembly in browser
- Update browser version

## Getting Help

- Check [GitHub Issues](https://github.com/your-username/zk-playground/issues)
- Join [Noir Discord](https://discord.gg/aztec)
- Read [Noir Documentation](https://noir-lang.org/docs)
