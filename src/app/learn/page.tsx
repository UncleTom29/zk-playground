'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  ChevronRight,
} from 'lucide-react';
import type { Tutorial, Lesson } from '@/types';

// Extended lesson type with completion tracking
type ExtendedLesson = Lesson & { completed?: boolean };
type ExtendedTutorial = Omit<Tutorial, 'lessons'> & { lessons: ExtendedLesson[] };

// Tutorial data
const TUTORIALS: ExtendedTutorial[] = [
  {
    id: 'intro-zk',
    title: 'Introduction to Zero-Knowledge Proofs',
    description: 'Learn the fundamentals of ZK proofs and how they enable privacy-preserving verification.',
    difficulty: 'beginner',
    estimatedTime: '30 min',
    lessons: [
      {
        id: 'what-is-zk',
        title: 'What is a Zero-Knowledge Proof?',
        content: `# What is a Zero-Knowledge Proof?

A zero-knowledge proof is a cryptographic method that allows one party (the prover) to prove to another party (the verifier) that a statement is true, without revealing any information beyond the validity of the statement itself.

## Key Properties

1. **Completeness**: If the statement is true, an honest prover can convince the verifier.
2. **Soundness**: If the statement is false, no cheating prover can convince the verifier.
3. **Zero-Knowledge**: The verifier learns nothing other than the fact that the statement is true.

## Real-World Analogy

Imagine you want to prove you know the password to a secret room, but you don't want to tell anyone what the password is. You could:

1. Enter the room through a door that requires the password
2. Exit through a different door
3. The verifier sees you enter and exit, proving you know the password, without learning what it is!`,
        starterCode: '',
        solution: '',
        hints: [],
        completed: true,
      },
      {
        id: 'public-vs-private',
        title: 'Public vs Private Inputs',
        content: `# Public vs Private Inputs

In ZK circuits, we distinguish between two types of inputs:

## Public Inputs
- Known to both prover and verifier
- Included in the proof for verification
- Used to define the statement being proven

## Private Inputs (Witnesses)
- Known only to the prover
- Not revealed in the proof
- Used to prove the statement without disclosure

## Example

\`\`\`noir
fn main(x: pub Field, y: Field) {
    //     ^^^        ^
    //     public     private (no pub keyword)

    assert(x == y * y);
}
\`\`\`

In this example:
- \`x\` is public: everyone knows the value we're proving about
- \`y\` is private: the prover knows the square root but doesn't reveal it`,
        starterCode: `fn main(x: pub Field, y: Field) {
    // Prove you know y such that x = y * y
    assert(x == y * y);
}`,
        solution: `fn main(x: pub Field, y: Field) {
    assert(x == y * y);
}`,
        hints: ['The pub keyword makes an input public', 'Private inputs are sometimes called witnesses'],
        completed: true,
      },
      {
        id: 'first-circuit',
        title: 'Your First Circuit',
        content: `# Your First Noir Circuit

Now let's write your first circuit! We'll create a simple proof that you know a number that, when doubled, equals a public value.

## Challenge

Write a circuit where:
- \`result\` is a public input (the doubled value)
- \`secret\` is a private input (your secret number)
- The circuit proves that \`result == secret * 2\``,
        starterCode: `fn main(result: pub Field, secret: Field) {
    // TODO: Assert that result equals secret * 2

}`,
        solution: `fn main(result: pub Field, secret: Field) {
    assert(result == secret * 2);
}`,
        hints: ['Use the assert function to create constraints', 'Multiply secret by 2 and compare to result'],
        challenge: {
          description: 'Complete the circuit to prove knowledge of a number that doubles to the public result',
          testCases: [
            { inputs: { result: '10', secret: '5' }, expectedOutput: null, description: 'Should pass with correct inputs', shouldPass: true },
            { inputs: { result: '10', secret: '3' }, expectedOutput: null, description: 'Should fail with incorrect inputs', shouldPass: false },
          ],
          requirements: ['Must use assert', 'Must multiply by 2'],
        },
      },
    ],
  },
  {
    id: 'merkle-trees',
    title: 'Merkle Trees & Privacy',
    description: 'Learn how Merkle trees enable efficient and private membership proofs.',
    difficulty: 'intermediate',
    estimatedTime: '45 min',
    lessons: [
      {
        id: 'merkle-intro',
        title: 'Introduction to Merkle Trees',
        content: `# Merkle Trees

A Merkle tree is a binary tree where:
- Leaf nodes contain hashes of data
- Internal nodes contain hashes of their children
- The root hash represents the entire dataset

## Properties

1. **Efficient verification**: Prove membership in O(log n) time
2. **Tamper-evident**: Any change alters the root hash
3. **Privacy-friendly**: Prove membership without revealing other elements`,
        starterCode: '',
        solution: '',
        hints: [],
      },
      {
        id: 'merkle-proof',
        title: 'Implementing Merkle Proofs',
        content: `# Merkle Proofs

A Merkle proof consists of:
- The leaf value you're proving membership for
- The sibling hashes along the path to the root
- The indices indicating left/right at each level`,
        starterCode: `use std::hash::poseidon;

fn main(root: pub Field, leaf: Field, sibling: Field, is_left: u1) {
    // TODO: Compute the parent hash and verify it equals the root

}`,
        solution: `use std::hash::poseidon;

fn main(root: pub Field, leaf: Field, sibling: Field, is_left: u1) {
    let computed_root = if is_left == 0 {
        poseidon::bn254::hash_2([leaf, sibling])
    } else {
        poseidon::bn254::hash_2([sibling, leaf])
    };
    assert(computed_root == root);
}`,
        hints: ['Hash order matters: left child first, then right', 'Use is_left to determine ordering'],
      },
    ],
  },
  {
    id: 'hash-functions',
    title: 'Cryptographic Hash Functions',
    description: 'Explore ZK-friendly hash functions and their applications in circuits.',
    difficulty: 'intermediate',
    estimatedTime: '40 min',
    lessons: [
      {
        id: 'hash-intro',
        title: 'Hash Functions in ZK',
        content: `# Hash Functions in Zero-Knowledge

Not all hash functions are equal in ZK circuits. Some are optimized for proving efficiency.

## ZK-Friendly Hashes

- **Poseidon**: Designed for ZK, very efficient
- **Pedersen**: Based on elliptic curves
- **MiMC**: Minimal multiplicative complexity

## Traditional Hashes

- **SHA-256**: Secure but expensive in circuits
- **Keccak**: Used in Ethereum, costly to prove`,
        starterCode: '',
        solution: '',
        hints: [],
      },
    ],
  },
];

export default function LearnPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);

  const getProgress = (tutorial: typeof TUTORIALS[0]) => {
    const completed = tutorial.lessons.filter((l) => l.completed).length;
    return (completed / tutorial.lessons.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Learn ZK Proofs</h1>
              <p className="text-muted-foreground">
                Interactive tutorials to master Zero-Knowledge circuits
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tutorial list */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Tutorials</h2>
            {TUTORIALS.map((tutorial, index) => {
              const progress = getProgress(tutorial);
              const isLocked = index > 0 && getProgress(TUTORIALS[index - 1]) < 100;

              return (
                <Card
                  key={tutorial.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTutorial === tutorial.id
                      ? 'border-primary'
                      : isLocked
                      ? 'opacity-50'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => !isLocked && setSelectedTutorial(tutorial.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : progress === 100 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-primary" />
                        )}
                        <CardTitle className="text-base">{tutorial.title}</CardTitle>
                      </div>
                      <Badge
                        variant={
                          tutorial.difficulty === 'beginner'
                            ? 'default'
                            : tutorial.difficulty === 'intermediate'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      {tutorial.estimatedTime}
                      <span className="mx-1">|</span>
                      {tutorial.lessons.length} lessons
                    </div>
                    <Progress value={progress} className="h-1" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tutorial content */}
          <div className="lg:col-span-2">
            {selectedTutorial ? (
              <TutorialContent
                tutorial={TUTORIALS.find((t) => t.id === selectedTutorial)!}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Select a Tutorial
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a tutorial from the list to start learning about
                  Zero-Knowledge proofs with Noir.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorialContent({ tutorial }: { tutorial: typeof TUTORIALS[0] }) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const lesson = tutorial.lessons[currentLesson];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{tutorial.title}</h2>
        <p className="text-muted-foreground">{tutorial.description}</p>
      </div>

      {/* Lesson navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tutorial.lessons.map((l, i) => (
          <Button
            key={l.id}
            variant={i === currentLesson ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentLesson(i)}
            className="flex-shrink-0"
          >
            {l.completed && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {i + 1}. {l.title}
          </Button>
        ))}
      </div>

      {/* Lesson content */}
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {lesson.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={i} className="text-2xl font-bold mt-6 mb-4">
                    {line.slice(2)}
                  </h1>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-xl font-semibold mt-4 mb-2">
                    {line.slice(3)}
                  </h2>
                );
              }
              if (line.startsWith('```')) {
                return null;
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={i} className="ml-4">
                    {line.slice(2)}
                  </li>
                );
              }
              if (line.trim()) {
                return (
                  <p key={i} className="mb-2">
                    {line}
                  </p>
                );
              }
              return null;
            })}
          </div>

          {/* Starter code */}
          {lesson.starterCode && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Try it yourself:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                {lesson.starterCode}
              </pre>
              <div className="flex gap-2 mt-4">
                <Link href="/playground">
                  <Button className="gap-2">
                    <Play className="h-4 w-4" />
                    Open in Playground
                  </Button>
                </Link>
                {lesson.hints.length > 0 && (
                  <Button variant="outline">Show Hints</Button>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              disabled={currentLesson === 0}
              onClick={() => setCurrentLesson(currentLesson - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={currentLesson === tutorial.lessons.length - 1}
              onClick={() => setCurrentLesson(currentLesson + 1)}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
