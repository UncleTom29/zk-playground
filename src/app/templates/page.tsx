'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Search,
  FileCode,
  Play,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useRouter } from 'next/navigation';

const TEMPLATES = [
  {
    id: 'hello-world',
    name: 'Hello World',
    description: 'Simple proof that you know the square root of a number',
    category: 'basic',
    difficulty: 'beginner',
    tags: ['arithmetic', 'simple'],
    code: `fn main(x: pub Field, y: Field) {
    // Prove that we know y such that x = y * y
    assert(x == y * y);
}`,
    sampleInputs: { x: '9', y: '3' },
  },
  {
    id: 'age-verification',
    name: 'Age Verification',
    description: 'Prove that your age is above a minimum threshold without revealing your actual age',
    category: 'basic',
    difficulty: 'beginner',
    tags: ['privacy', 'comparison'],
    code: `fn main(age: Field, min_age: pub Field) {
    // Prove age >= min_age without revealing actual age
    assert(age as u32 >= min_age as u32);
}`,
    sampleInputs: { age: '25', min_age: '18' },
  },
  {
    id: 'range-proof',
    name: 'Range Proof',
    description: 'Prove that a value lies within a specified range',
    category: 'basic',
    difficulty: 'beginner',
    tags: ['range', 'comparison'],
    code: `fn main(value: Field, min: pub Field, max: pub Field) {
    // Prove value is within range [min, max]
    let v = value as u64;
    let lower = min as u64;
    let upper = max as u64;

    assert(v >= lower);
    assert(v <= upper);
}`,
    sampleInputs: { value: '50', min: '0', max: '100' },
  },
  {
    id: 'equality-check',
    name: 'Equality Check',
    description: 'Prove that two private values are equal without revealing them',
    category: 'basic',
    difficulty: 'beginner',
    tags: ['equality', 'simple'],
    code: `fn main(expected_hash: pub Field, a: Field, b: Field) {
    // Prove a == b without revealing the values
    assert(a == b);
}`,
    sampleInputs: { expected_hash: '1', a: '42', b: '42' },
  },
  {
    id: 'hash-preimage',
    name: 'Hash Preimage',
    description: 'Prove knowledge of a hash preimage without revealing it',
    category: 'cryptography',
    difficulty: 'beginner',
    tags: ['hash', 'preimage', 'poseidon'],
    code: `use std::hash::poseidon;

fn main(hash: pub Field, preimage: Field) {
    // Prove knowledge of preimage without revealing it
    let computed = poseidon::bn254::hash_1([preimage]);
    assert(hash == computed);
}`,
    sampleInputs: { hash: '0x...', preimage: '12345' },
  },
  {
    id: 'merkle-membership',
    name: 'Merkle Tree Membership',
    description: 'Prove that a leaf exists in a Merkle tree without revealing the full tree',
    category: 'privacy',
    difficulty: 'intermediate',
    tags: ['merkle', 'membership', 'tree'],
    code: `use std::hash::poseidon;

fn main(root: pub Field, leaf: Field, path: [Field; 3], indices: [u1; 3]) {
    let mut current = leaf;

    for i in 0..3 {
        let sibling = path[i];
        if indices[i] == 0 {
            current = poseidon::bn254::hash_2([current, sibling]);
        } else {
            current = poseidon::bn254::hash_2([sibling, current]);
        }
    }

    assert(current == root);
}`,
    sampleInputs: { root: '0x...', leaf: '42', path: '[0, 0, 0]', indices: '[0, 0, 0]' },
  },
  {
    id: 'commitment-scheme',
    name: 'Commitment Scheme',
    description: 'Commit to a value and later reveal it with proof',
    category: 'cryptography',
    difficulty: 'intermediate',
    tags: ['commitment', 'pedersen'],
    code: `use std::hash::pedersen_hash;

fn main(commitment: pub Field, value: Field, blinding: Field) {
    // Verify commitment = hash(value, blinding)
    let computed = pedersen_hash([value, blinding]);
    assert(commitment == computed);
}`,
    sampleInputs: { commitment: '0x...', value: '100', blinding: '12345' },
  },
  {
    id: 'sudoku-verifier',
    name: 'Sudoku Verifier',
    description: 'Verify a Sudoku solution without revealing the answer',
    category: 'games',
    difficulty: 'intermediate',
    tags: ['sudoku', 'game', 'puzzle'],
    code: `fn main(puzzle: pub [u8; 81], solution: [u8; 81]) {
    // Verify solution matches puzzle constraints
    for i in 0..81 {
        if puzzle[i] != 0 {
            assert(puzzle[i] == solution[i]);
        }
        // Each cell should be 1-9
        assert(solution[i] >= 1);
        assert(solution[i] <= 9);
    }

    // TODO: Add row, column, and box uniqueness checks
}`,
    sampleInputs: { puzzle: '[...]', solution: '[...]' },
  },
  {
    id: 'private-voting',
    name: 'Private Voting',
    description: 'Cast a vote anonymously while proving eligibility',
    category: 'privacy',
    difficulty: 'intermediate',
    tags: ['voting', 'anonymous', 'privacy'],
    code: `use std::hash::poseidon;

fn main(
    root: pub Field,           // Merkle root of eligible voters
    nullifier_hash: pub Field, // Prevents double voting
    vote: pub Field,           // 0 or 1
    secret: Field,             // Private key
    path: [Field; 4],
    indices: [u1; 4]
) {
    // Verify vote is valid (0 or 1)
    assert((vote == 0) | (vote == 1));

    // Compute nullifier to prevent double voting
    let computed_nullifier = poseidon::bn254::hash_1([secret]);
    assert(nullifier_hash == computed_nullifier);

    // Verify membership in eligible voters tree
    let leaf = poseidon::bn254::hash_1([secret]);
    let mut current = leaf;

    for i in 0..4 {
        let sibling = path[i];
        if indices[i] == 0 {
            current = poseidon::bn254::hash_2([current, sibling]);
        } else {
            current = poseidon::bn254::hash_2([sibling, current]);
        }
    }

    assert(current == root);
}`,
    sampleInputs: { root: '0x...', nullifier_hash: '0x...', vote: '1', secret: '12345', path: '[...]', indices: '[...]' },
  },
  {
    id: 'private-transfer',
    name: 'Private Token Transfer',
    description: 'Transfer tokens privately while proving balance sufficiency',
    category: 'privacy',
    difficulty: 'advanced',
    tags: ['transfer', 'tokens', 'privacy', 'balance'],
    code: `use std::hash::poseidon;

fn main(
    sender_balance_hash: pub Field,
    receiver_balance_hash: pub Field,
    amount: pub Field,
    sender_balance: Field,
    receiver_balance: Field,
    sender_blinding: Field,
    receiver_blinding: Field
) {
    // Verify sender has sufficient balance
    assert(sender_balance as u64 >= amount as u64);

    // Verify balance commitments
    let sender_commit = poseidon::bn254::hash_2([sender_balance, sender_blinding]);
    let receiver_commit = poseidon::bn254::hash_2([receiver_balance, receiver_blinding]);

    assert(sender_balance_hash == sender_commit);
    assert(receiver_balance_hash == receiver_commit);
}`,
    sampleInputs: { sender_balance_hash: '0x...', receiver_balance_hash: '0x...', amount: '100', sender_balance: '500', receiver_balance: '200', sender_blinding: '123', receiver_blinding: '456' },
  },
];

type Category = 'all' | 'basic' | 'cryptography' | 'privacy' | 'games' | 'defi';
type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const { setCode } = useEditorStore();
  const router = useRouter();

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = category === 'all' || template.category === category;
    const matchesDifficulty = difficulty === 'all' || template.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    setCode(template.code);
    router.push('/playground');
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
              <h1 className="text-2xl font-bold">Circuit Templates</h1>
              <p className="text-muted-foreground">
                Pre-built circuits for common ZK use cases
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="cryptography">Cryptography</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="games">Games</SelectItem>
                <SelectItem value="defi">DeFi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge
                    variant={
                      template.difficulty === 'beginner'
                        ? 'default'
                        : template.difficulty === 'intermediate'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {template.difficulty}
                  </Badge>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                  {template.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <pre className="flex-1 bg-muted p-3 rounded text-xs overflow-x-auto mb-4 max-h-32">
                  {template.code.split('\n').slice(0, 6).join('\n')}
                  {template.code.split('\n').length > 6 && '\n...'}
                </pre>
                <Button
                  className="w-full gap-2"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Play className="h-4 w-4" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
