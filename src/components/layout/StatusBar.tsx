'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCompilerStore } from '@/stores/compilerStore';
import { useProverStore } from '@/stores/proverStore';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
  FileCode,
  Shield,
} from 'lucide-react';

interface StatusBarProps {
  cursorPosition?: { line: number; column: number };
}

export default function StatusBar({ cursorPosition }: StatusBarProps) {
  const {
    status: compileStatus,
    compileResult,
    errors,
    warnings,
    isCompiling,
  } = useCompilerStore();

  const {
    status: proveStatus,
    proofResult,
    isProving,
    provingProgress,
  } = useProverStore();

  const getCompileStatusBadge = () => {
    if (isCompiling) {
      return (
        <Badge variant="outline" className="gap-1 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          Compiling...
        </Badge>
      );
    }

    switch (compileStatus) {
      case 'success':
        return (
          <Badge variant="default" className="gap-1 bg-green-600 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Compiled
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            <XCircle className="h-3 w-3" />
            {errors.length} error{errors.length !== 1 ? 's' : ''}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
            <FileCode className="h-3 w-3" />
            Not compiled
          </Badge>
        );
    }
  };

  const getProveStatusBadge = () => {
    if (isProving) {
      return (
        <Badge variant="outline" className="gap-1 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          Proving {provingProgress}%
        </Badge>
      );
    }

    switch (proveStatus) {
      case 'success':
        return (
          <Badge variant="default" className="gap-1 bg-blue-600 text-xs">
            <Shield className="h-3 w-3" />
            Proof ready
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            <XCircle className="h-3 w-3" />
            Proving failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <footer className="flex h-6 items-center justify-between border-t bg-muted/50 px-4 text-xs">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Compile status */}
        {getCompileStatusBadge()}

        {/* Warnings */}
        {warnings.length > 0 && (
          <Badge variant="outline" className="gap-1 text-xs text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
          </Badge>
        )}

        {/* Prove status */}
        {getProveStatusBadge()}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 text-muted-foreground">
        {/* Compile time */}
        {compileResult && (
          <>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Compile: {formatTime(compileResult.compileTime)}
            </span>
            <Separator orientation="vertical" className="h-3" />
          </>
        )}

        {/* Bytecode size */}
        {compileResult?.bytecode && (
          <>
            <span>Bytecode: {formatBytes(compileResult.bytecode.length)}</span>
            <Separator orientation="vertical" className="h-3" />
          </>
        )}

        {/* Proof size */}
        {proofResult && (
          <>
            <span>Proof: {formatBytes(proofResult.proofSize)}</span>
            <Separator orientation="vertical" className="h-3" />
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Prove: {formatTime(proofResult.provingTime)}
            </span>
            <Separator orientation="vertical" className="h-3" />
          </>
        )}

        {/* Cursor position */}
        {cursorPosition && (
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        )}

        {/* Language */}
        <span>Noir</span>
      </div>
    </footer>
  );
}
