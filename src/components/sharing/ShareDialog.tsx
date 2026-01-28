'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Share2,
  Copy,
  CheckCircle,
  Loader2,
  ExternalLink,
  Twitter,
  Link2,
  Globe,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useCompilerStore } from '@/stores/compilerStore';
import { getIPFSService, GalleryService } from '@/lib/storage/ipfs';
import type { SharedCircuit } from '@/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const { code, currentFileName } = useEditorStore();
  const { compileResult } = useCompilerStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareResult, setShareResult] = useState<{
    cid: string;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const ipfs = getIPFSService();

      setUploadProgress(30);

      // Create shared circuit data
      const circuitData: SharedCircuit = {
        cid: '', // Will be set after upload
        code,
        title: title.trim(),
        description: description.trim(),
        author: author.trim() || 'Anonymous',
        timestamp: Date.now(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        bytecode: compileResult?.bytecode,
        abi: compileResult?.abi,
      };

      setUploadProgress(50);

      // Upload to IPFS
      const result = await ipfs.upload(circuitData);

      setUploadProgress(80);

      // Update CID in data and add to gallery
      circuitData.cid = result.cid;
      await GalleryService.addCircuit(circuitData);

      setUploadProgress(100);
      setShareResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share circuit');
    } finally {
      setIsUploading(false);
    }
  }, [code, title, description, author, tags, compileResult]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const shareOnTwitter = useCallback(() => {
    if (!shareResult) return;

    const text = encodeURIComponent(
      `Check out my ZK circuit "${title}" on ZK-Playground!\n\n${shareResult.url}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }, [shareResult, title]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setTags('');
    setAuthor('');
    setShareResult(null);
    setError(null);
    setUploadProgress(0);
  }, []);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  }, [isUploading, resetForm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Circuit
          </DialogTitle>
          <DialogDescription>
            Share your circuit with the community via IPFS
          </DialogDescription>
        </DialogHeader>

        {!shareResult ? (
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="My Awesome Circuit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A brief description of what this circuit does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isUploading}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="zk, privacy, merkle (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isUploading}
              />
              {tags && (
                <div className="flex flex-wrap gap-1">
                  {tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t)
                    .map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Your name or handle (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isUploading}
              />
            </div>

            {/* Code preview */}
            <div className="p-3 rounded bg-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {currentFileName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {code.length} chars
                </span>
              </div>
              <pre className="text-xs max-h-24 overflow-auto">
                <code>{code.slice(0, 500)}...</code>
              </pre>
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading to IPFS...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isUploading || !title.trim()}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success message */}
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold">Circuit Shared!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Your circuit is now available on IPFS
              </p>
            </div>

            {/* CID */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">IPFS CID</Label>
              <div className="flex items-center gap-2 p-2 rounded bg-muted">
                <code className="text-xs flex-1 truncate">{shareResult.cid}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(shareResult.cid, 'cid')}
                >
                  {copiedField === 'cid' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Share URL */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Share URL</Label>
              <div className="flex items-center gap-2 p-2 rounded bg-muted">
                <code className="text-xs flex-1 truncate">{shareResult.url}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(shareResult.url, 'url')}
                >
                  {copiedField === 'url' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                  <a href={shareResult.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Social share buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareOnTwitter}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => copyToClipboard(shareResult.url, 'share')}
              >
                {copiedField === 'share' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>

            {/* Done button */}
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
