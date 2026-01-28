'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Copy,
  Check,
  Play,
  User,
  Clock,
  Eye,
  Heart,
  Share2,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useRouter } from 'next/navigation';

// Mock data - in production, this would fetch from IPFS
const MOCK_CIRCUITS: Record<string, {
  title: string;
  description: string;
  author: string;
  timestamp: number;
  tags: string[];
  views: number;
  likes: number;
  code: string;
}> = {
  'Qm1234567890abcdef': {
    title: 'Private Age Verification',
    description: 'Prove you are above a certain age without revealing your actual birthdate.',
    author: 'zkdev.eth',
    timestamp: Date.now() - 86400000 * 2,
    tags: ['privacy', 'verification', 'age'],
    views: 1234,
    likes: 89,
    code: `fn main(birthdate: Field, current_date: pub Field, min_age: pub Field) {
    let age = (current_date - birthdate) / 31536000; // seconds in a year
    assert(age as u32 >= min_age as u32);
}`,
  },
};

export default function SharePage({ params }: { params: Promise<{ cid: string }> }) {
  const { cid } = use(params);
  const [copied, setCopied] = useState(false);
  const { setCode } = useEditorStore();
  const router = useRouter();

  // In production, this would fetch from IPFS using the CID
  const circuit = MOCK_CIRCUITS[cid];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (circuit) {
      navigator.clipboard.writeText(circuit.code);
    }
  };

  const handleImport = () => {
    if (circuit) {
      setCode(circuit.code);
      router.push('/playground');
    }
  };

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

  if (!circuit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Circuit Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The circuit you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/gallery">
            <Button>Browse Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/gallery">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{circuit.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <User className="h-3 w-3" />
                  <span>{circuit.author}</span>
                  <span className="mx-1">|</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(circuit.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
              <Button onClick={handleImport}>
                <Play className="h-4 w-4 mr-2" />
                Open in Playground
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Circuit Code</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {circuit.code}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{circuit.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {circuit.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{circuit.views}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Heart className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{circuit.likes}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CID */}
            <Card>
              <CardHeader>
                <CardTitle>IPFS CID</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                  {cid}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
