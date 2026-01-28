'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Search,
  Eye,
  Heart,
  Clock,
  User,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useRouter } from 'next/navigation';

// Mock gallery data
const GALLERY_CIRCUITS = [
  {
    cid: 'Qm1234567890abcdef',
    title: 'Private Age Verification',
    description: 'Prove you are above a certain age without revealing your actual birthdate.',
    author: 'zkdev.eth',
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    tags: ['privacy', 'verification', 'age'],
    views: 1234,
    likes: 89,
    code: `fn main(birthdate: Field, current_date: pub Field, min_age: pub Field) {
    let age = (current_date - birthdate) / 31536000; // seconds in a year
    assert(age as u32 >= min_age as u32);
}`,
  },
  {
    cid: 'Qm2345678901bcdefg',
    title: 'Merkle Airdrop Claim',
    description: 'Claim tokens from an airdrop by proving membership in the Merkle tree without revealing your position.',
    author: 'anon.lens',
    timestamp: Date.now() - 86400000 * 5, // 5 days ago
    tags: ['merkle', 'airdrop', 'defi'],
    views: 856,
    likes: 67,
    code: `use std::hash::poseidon;

fn main(
    root: pub Field,
    recipient: pub Field,
    amount: pub Field,
    nullifier: pub Field,
    secret: Field,
    path: [Field; 8],
    indices: [u1; 8]
) {
    // Verify nullifier
    let computed_nullifier = poseidon::bn254::hash_1([secret]);
    assert(nullifier == computed_nullifier);

    // Verify leaf
    let leaf = poseidon::bn254::hash_3([recipient, amount, secret]);

    // Verify Merkle proof
    let mut current = leaf;
    for i in 0..8 {
        if indices[i] == 0 {
            current = poseidon::bn254::hash_2([current, path[i]]);
        } else {
            current = poseidon::bn254::hash_2([path[i], current]);
        }
    }

    assert(current == root);
}`,
  },
  {
    cid: 'Qm3456789012cdefgh',
    title: 'Sudoku Solution Verifier',
    description: 'Verify that you know the solution to a Sudoku puzzle without revealing the answers.',
    author: 'puzzlemaster',
    timestamp: Date.now() - 86400000 * 7, // 1 week ago
    tags: ['games', 'puzzle', 'sudoku'],
    views: 2341,
    likes: 156,
    code: `fn main(puzzle: pub [u8; 81], solution: [u8; 81]) {
    // Verify solution matches given clues
    for i in 0..81 {
        if puzzle[i] != 0 {
            assert(puzzle[i] == solution[i]);
        }
        assert(solution[i] >= 1);
        assert(solution[i] <= 9);
    }

    // Verify each row
    for row in 0..9 {
        let mut seen: [bool; 9] = [false; 9];
        for col in 0..9 {
            let val = solution[row * 9 + col] - 1;
            assert(!seen[val as Field]);
            seen[val as Field] = true;
        }
    }

    // Similar checks for columns and boxes...
}`,
  },
  {
    cid: 'Qm4567890123defghi',
    title: 'Private Auction Bid',
    description: 'Submit a sealed bid to an auction that can be verified without revealing the amount until the reveal phase.',
    author: 'defi-builder',
    timestamp: Date.now() - 86400000 * 10, // 10 days ago
    tags: ['defi', 'auction', 'commitment'],
    views: 567,
    likes: 34,
    code: `use std::hash::pedersen_hash;

fn main(
    commitment: pub Field,
    bid_amount: Field,
    blinding_factor: Field,
    min_bid: pub Field
) {
    // Verify bid is above minimum
    assert(bid_amount as u64 >= min_bid as u64);

    // Verify commitment
    let computed = pedersen_hash([bid_amount, blinding_factor]);
    assert(commitment == computed);
}`,
  },
  {
    cid: 'Qm5678901234efghij',
    title: 'ECDSA Signature Verifier',
    description: 'Verify an ECDSA signature in zero-knowledge, useful for proving authorization without revealing the signature.',
    author: 'crypto-wizard',
    timestamp: Date.now() - 86400000 * 14, // 2 weeks ago
    tags: ['cryptography', 'signature', 'ecdsa'],
    views: 3210,
    likes: 201,
    code: `use std::ecdsa_secp256k1;

fn main(
    pub_key_x: pub Field,
    pub_key_y: pub Field,
    message_hash: pub Field,
    signature: [u8; 64]
) {
    let pub_key = [pub_key_x, pub_key_y];
    let message = message_hash.to_le_bytes(32);

    // Verify the signature
    let valid = ecdsa_secp256k1::verify_signature(pub_key, signature, message);
    assert(valid);
}`,
  },
];

type Filter = 'recent' | 'popular' | 'trending';

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('recent');
  const [copied, setCopied] = useState<string | null>(null);
  const { setCode } = useEditorStore();
  const router = useRouter();

  const filteredCircuits = GALLERY_CIRCUITS.filter(
    (circuit) =>
      circuit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circuit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circuit.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      circuit.author.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (filter) {
      case 'popular':
        return b.likes - a.likes;
      case 'trending':
        return b.views - a.views;
      default:
        return b.timestamp - a.timestamp;
    }
  });

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  const handleCopyLink = (cid: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${cid}`);
    setCopied(cid);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleImport = (circuit: typeof GALLERY_CIRCUITS[0]) => {
    setCode(circuit.code);
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
              <h1 className="text-2xl font-bold">Community Gallery</h1>
              <p className="text-muted-foreground">
                Explore circuits shared by the community
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search circuits, tags, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCircuits.map((circuit) => (
            <Card key={circuit.cid} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{circuit.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{circuit.author}</span>
                      <span className="mx-1">|</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(circuit.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {circuit.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {circuit.likes}
                    </span>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {circuit.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1 mb-4">
                  {circuit.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <pre className="flex-1 bg-muted p-3 rounded text-xs overflow-x-auto mb-4 max-h-32">
                  {circuit.code.split('\n').slice(0, 8).join('\n')}
                  {circuit.code.split('\n').length > 8 && '\n...'}
                </pre>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleImport(circuit)}
                  >
                    Import to Playground
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(circuit.cid)}
                  >
                    {copied === circuit.cid ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={`/share/${circuit.cid}`}>
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCircuits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No circuits found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
