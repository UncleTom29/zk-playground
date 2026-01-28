'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import Toolbar from '@/components/layout/Toolbar';
import StatusBar from '@/components/layout/StatusBar';
import Sidebar from '@/components/layout/Sidebar';
import OutputPanel from '@/components/layout/OutputPanel';
import { DeploymentWizard, OnChainVerifier } from '@/components/deployment';
import { ShareDialog } from '@/components/sharing';
import { useEditorStore } from '@/stores/editorStore';
import { useCompilerStore } from '@/stores/compilerStore';
import { useProverStore } from '@/stores/proverStore';
import type { CompilerError } from '@/components/editor/NoirEditor';

// Dynamically import NoirEditor to avoid SSR issues with Monaco
const NoirEditor = dynamic(() => import('@/components/editor/NoirEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading editor...</span>
      </div>
    </div>
  ),
});

export default function PlaygroundPage() {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [deploymentOpen, setDeploymentOpen] = useState(false);
  const [verifierOpen, setVerifierOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { code, setCode, theme, sidebarOpen } = useEditorStore();
  const {
    errors,
    startCompile,
    finishCompile,
    failCompile,
    compileResult,
  } = useCompilerStore();
  const {
    inputs,
    startProving,
    finishProving,
    failProving,
    startVerification,
    finishVerification,
  } = useProverStore();

  // Handle compile action
  const handleCompile = useCallback(async () => {
    startCompile();

    try {
      // Simulated compilation for now (will be replaced with real Noir WASM)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful compilation
      const mockResult = {
        bytecode: new Uint8Array([0, 1, 2, 3, 4, 5]),
        abi: {
          parameters: [
            { name: 'x', type: { kind: 'field' as const }, visibility: 'public' as const },
            { name: 'y', type: { kind: 'field' as const }, visibility: 'private' as const },
          ],
          param_witnesses: {},
          return_type: null,
          return_witnesses: [],
          error_types: {},
        },
        compileTime: 823,
        warnings: [],
      };

      finishCompile(mockResult);
    } catch (error) {
      const compileError: CompilerError = {
        line: 1,
        column: 1,
        message: error instanceof Error ? error.message : 'Compilation failed',
        severity: 'error',
      };
      failCompile([compileError]);
    }
  }, [startCompile, finishCompile, failCompile]);

  // Handle prove action
  const handleProve = useCallback(async () => {
    if (!compileResult) return;

    startProving();

    try {
      // Simulated proof generation for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockProof = {
        proof: new Uint8Array(128).fill(0).map(() => Math.floor(Math.random() * 256)),
        publicInputs: ['0x123...', '0x456...'],
        verificationKey: new Uint8Array(64).fill(0).map(() => Math.floor(Math.random() * 256)),
        provingTime: 1823,
        proofSize: 128,
      };

      finishProving(mockProof);
    } catch (error) {
      failProving(error instanceof Error ? error.message : 'Proof generation failed');
    }
  }, [compileResult, startProving, finishProving, failProving]);

  // Handle verify action
  const handleVerify = useCallback(async () => {
    startVerification();

    try {
      // Simulated verification
      await new Promise((resolve) => setTimeout(resolve, 500));

      finishVerification({
        isValid: true,
        verificationTime: 45,
      });
    } catch {
      finishVerification({
        isValid: false,
        verificationTime: 0,
      });
    }
  }, [startVerification, finishVerification]);

  // Handle deploy action
  const handleDeploy = useCallback(() => {
    setDeploymentOpen(true);
  }, []);

  // Handle verify on-chain action
  const handleVerifyOnChain = useCallback(() => {
    setVerifierOpen(true);
  }, []);

  // Handle share action
  const handleShare = useCallback(() => {
    setShareOpen(true);
  }, []);

  // Handle template selection
  const handleSelectTemplate = useCallback(
    (template: { name: string; code: string }) => {
      setCode(template.code);
    },
    [setCode]
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Toolbar */}
      <Toolbar
        onCompile={handleCompile}
        onProve={handleProve}
        onVerify={handleVerify}
        onDeploy={handleDeploy}
        onShare={handleShare}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && <Sidebar onSelectTemplate={handleSelectTemplate} />}

        {/* Editor and output panels */}
        <div className="flex-1">
          <Allotment vertical>
            {/* Editor pane */}
            <Allotment.Pane minSize={200}>
              <NoirEditor
                code={code}
                onChange={setCode}
                theme={theme === 'light' ? 'light' : 'dark'}
                errors={errors}
                onCompile={handleCompile}
                onProve={handleProve}
              />
            </Allotment.Pane>

            {/* Output pane */}
            <Allotment.Pane minSize={100} preferredSize={250}>
              <OutputPanel />
            </Allotment.Pane>
          </Allotment>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar cursorPosition={cursorPosition} />

      {/* Deployment Wizard Dialog */}
      <DeploymentWizard
        open={deploymentOpen}
        onOpenChange={setDeploymentOpen}
      />

      {/* On-Chain Verifier Dialog */}
      <OnChainVerifier
        open={verifierOpen}
        onOpenChange={setVerifierOpen}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </div>
  );
}
