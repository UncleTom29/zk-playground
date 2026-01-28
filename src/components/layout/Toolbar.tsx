'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  CheckCircle,
  Upload,
  Share2,
  Settings,
  Moon,
  Sun,
  FileCode,
  BookOpen,
  LayoutGrid,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useCompilerStore } from '@/stores/compilerStore';
import { useProverStore } from '@/stores/proverStore';

interface ToolbarProps {
  onCompile?: () => void;
  onProve?: () => void;
  onVerify?: () => void;
  onDeploy?: () => void;
  onShare?: () => void;
}

export default function Toolbar({
  onCompile,
  onProve,
  onVerify,
  onDeploy,
  onShare,
}: ToolbarProps) {
  const { theme, setTheme, currentFileName, isModified } = useEditorStore();
  const { status: compileStatus, isCompiling } = useCompilerStore();
  const { status: proveStatus, isProving } = useProverStore();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const hasCompiledCircuit = compileStatus === 'success';
  const hasProof = proveStatus === 'success';

  return (
    <TooltipProvider>
      <header className="flex h-12 items-center justify-between border-b bg-background px-4">
        {/* Left section - Logo and navigation */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              ZK
            </div>
            <span className="hidden font-semibold sm:inline">ZK-Playground</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/playground">
              <Button variant="ghost" size="sm" className="gap-2">
                <FileCode className="h-4 w-4" />
                Playground
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Templates
              </Button>
            </Link>
            <Link href="/learn">
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Learn
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Gallery
              </Button>
            </Link>
          </nav>
        </div>

        {/* Center section - File name */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="text-sm text-muted-foreground">{currentFileName}</span>
          {isModified && (
            <Badge variant="outline" className="text-xs">
              Modified
            </Badge>
          )}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Compile button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={compileStatus === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={onCompile}
                disabled={isCompiling}
                className="gap-2"
              >
                {isCompiling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Compile</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compile circuit (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>

          {/* Prove button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={proveStatus === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={onProve}
                disabled={!hasCompiledCircuit || isProving}
                className="gap-2"
              >
                {isProving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Prove</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate proof (Ctrl+P)</p>
            </TooltipContent>
          </Tooltip>

          {/* Deploy dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasProof}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Deploy</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deploy to Solana</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDeploy?.()}>
                Deploy to Devnet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeploy?.()}>
                Deploy to Mainnet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onVerify} disabled={!hasProof}>
                Verify Locally
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share circuit</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
