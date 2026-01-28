# Contributing to ZK-Playground

Thank you for your interest in contributing to ZK-Playground! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/zk-playground.git
   cd zk-playground
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm test -- --coverage

# E2E tests
npm run e2e
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
│   ├── ui/          # shadcn/ui base components
│   ├── editor/      # Monaco editor components
│   ├── deployment/  # Solana deployment components
│   ├── tutorials/   # Tutorial components
│   ├── templates/   # Template browser components
│   └── sharing/     # Circuit sharing components
├── lib/             # Core libraries and utilities
│   ├── noir/        # Noir language support
│   ├── solana/      # Solana integration
│   ├── storage/     # IPFS and storage services
│   ├── tutorials/   # Tutorial data and test runner
│   └── templates/   # Template library
├── stores/          # Zustand state management
└── types/           # TypeScript type definitions
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` type when possible
- Use interfaces for object shapes
- Export types from dedicated files

### React

- Use functional components with hooks
- Keep components focused and reusable
- Use proper TypeScript props typing
- Follow the naming conventions:
  - Components: PascalCase
  - Files: PascalCase for components, camelCase for utilities
  - Hooks: `use` prefix (e.g., `useCompilerStore`)

### Styling

- Use TailwindCSS for styling
- Follow the existing design system
- Use shadcn/ui components when possible
- Maintain dark/light theme compatibility

### State Management

- Use Zustand stores for global state
- Keep stores focused on specific domains
- Use persistence middleware for state that should survive refreshes

## Adding Features

### Adding a New Template

1. Add template to `src/lib/templates/templateData.ts`:
   ```typescript
   const myTemplate: Template = {
     id: 'my-template',
     name: 'My Template',
     description: 'Description of the template',
     category: 'basic', // or 'cryptography', 'privacy', 'games', 'defi'
     difficulty: 'beginner', // or 'intermediate', 'advanced'
     code: `fn main() { ... }`,
     sampleInputs: { x: '1' },
     tags: ['tag1', 'tag2'],
   };
   ```
2. Add to the `templates` array
3. Add unit tests in `tests/unit/lib/templates.test.ts`

### Adding a New Tutorial

1. Create tutorial data in `src/lib/tutorials/tutorialData.ts`:
   ```typescript
   const myTutorial: Tutorial = {
     id: 'my-tutorial',
     title: 'My Tutorial',
     description: 'Tutorial description',
     difficulty: 'beginner',
     estimatedTime: '20 min',
     lessons: [
       {
         id: 'lesson-1',
         title: 'Lesson Title',
         content: `# Markdown content...`,
         starterCode: `fn main() { }`,
         solution: `fn main() { assert(true); }`,
         hints: ['Hint 1', 'Hint 2'],
         challenge: {
           description: 'Challenge description',
           testCases: [...],
           requirements: [...],
         },
       },
     ],
   };
   ```
2. Add to the `tutorials` array
3. Add tests in `tests/unit/lib/tutorials.test.ts`

### Adding a New Component

1. Create component file in appropriate directory
2. Export from `index.ts` in the same directory
3. Add unit tests if component has logic
4. Update documentation if needed

## Testing

### Unit Tests

- Use Jest and React Testing Library
- Test component behavior, not implementation
- Mock external dependencies
- Aim for 80%+ coverage on new code

### E2E Tests

- Use Playwright
- Focus on critical user flows
- Test across multiple browsers
- Include accessibility checks

## Pull Request Process

1. Ensure all tests pass
2. Update documentation as needed
3. Fill out the PR template completely
4. Request review from maintainers
5. Address review feedback
6. Squash commits before merge

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(templates): add sudoku verifier template
fix(editor): resolve syntax highlighting for arrays
docs(readme): update installation instructions
```

## Getting Help

- Open a GitHub issue for bugs or feature requests
- Join the Noir Discord for ZK-related questions
- Tag maintainers for urgent issues

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing!
