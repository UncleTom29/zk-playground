'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  ExternalLink,
  Twitter,
  Loader2,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useRouter } from 'next/navigation';
import { getIPFSService, GalleryService } from '@/lib/storage/ipfs';
import type { SharedCircuit } from '@/types';

export default function SharePage({ params }: { params: Promise<{ cid: string }> }) {
  const { cid } = use(params);
  const [circuit, setCircuit] = useState<SharedCircuit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);

  const { setCode, setCurrentFileName } = useEditorStore();
  const router = useRouter();

  // Fetch circuit from IPFS
  useEffect(() => {
    async function fetchCircuit() {
      setLoading(true);
      setError(null);

      try {
        const ipfs = getIPFSService();
        const data = await ipfs.download(cid);
        setCircuit(data);

        // Increment views
        await GalleryService.incrementViews(cid);

        // Get stats
        const galleries = await GalleryService.getCircuits('all', 100);
        const galleryCircuit = galleries.find((c) => c.cid === cid);
        if (galleryCircuit) {
          setViews(galleryCircuit.views);
          setLikes(galleryCircuit.likes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load circuit');
      } finally {
        setLoading(false);
      }
    }

    fetchCircuit();
  }, [cid]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyLink = () => {
    handleCopy(window.location.href, 'link');
  };

  const handleCopyCode = () => {
    if (circuit) {
      handleCopy(circuit.code, 'code');
    }
  };

  const handleImport = () => {
    if (circuit) {
      setCode(circuit.code);
      setCurrentFileName(`${circuit.title.toLowerCase().replace(/\s+/g, '-')}.nr`);
      router.push('/playground');
    }
  };

  const handleLike = async () => {
    await GalleryService.incrementLikes(cid);
    setLikes((prev) => prev + 1);
  };

  const shareOnTwitter = () => {
    if (!circuit) return;
    const text = encodeURIComponent(
      `Check out this ZK circuit "${circuit.title}" on ZK-Playground!\n\n${window.location.href}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/gallery">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !circuit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Circuit Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'The circuit you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/gallery">
              <Button>Browse Gallery</Button>
            </Link>
            <Link href="/playground">
              <Button variant="outline">Create New Circuit</Button>
            </Link>
          </div>
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
                  <span>{circuit.author || 'Anonymous'}</span>
                  <span className="mx-1">|</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(circuit.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                <Twitter className="h-4 w-4 mr-2" />
                Tweet
              </Button>
              <Button variant="outline" onClick={handleCopyLink}>
                {copied === 'link' ? (
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
                    {copied === 'code' ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
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
                <p className="text-muted-foreground">
                  {circuit.description || 'No description provided.'}
                </p>
                {circuit.tags && circuit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {circuit.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
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
                    <p className="text-2xl font-bold">{views}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <button
                    className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    onClick={handleLike}
                  >
                    <Heart className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{likes}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* IPFS Info */}
            <Card>
              <CardHeader>
                <CardTitle>IPFS Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">CID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      {cid}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(cid, 'cid')}
                    >
                      {copied === 'cid' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={`https://ipfs.io/ipfs/${cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on IPFS
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
