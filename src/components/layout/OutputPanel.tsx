'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  FileJson,
  Shield,
  Key,
} from 'lucide-react';
import { useCompilerStore } from '@/stores/compilerStore';
import { useProverStore } from '@/stores/proverStore';
import { cn } from '@/lib/utils';

export default function OutputPanel() {
  const [activeTab, setActiveTab] = useState('console');
  const [copied, setCopied] = useState<string | null>(null);

  const { status: compileStatus, compileResult, errors, warnings } = useCompilerStore();
  const { proofResult, verificationResult } = useProverStore();

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (content: string | Uint8Array, filename: string) => {
    let blob: Blob;
    if (content instanceof Uint8Array) {
      // Create a new Uint8Array copy to ensure regular ArrayBuffer
      const copy = new Uint8Array(content);
      blob = new Blob([copy.buffer], { type: 'application/octet-stream' });
    } else {
      blob = new Blob([content], { type: 'application/json' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const renderConsole = () => (
    <ScrollArea className="h-full">
      <div className="p-4 font-mono text-sm">
        {/* Errors */}
        {errors.map((error, i) => (
          <div key={i} className="mb-2 flex items-start gap-2 text-red-500">
            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Error</span>
              {error.line > 0 && (
                <span className="text-muted-foreground">
                  {' '}
                  at line {error.line}:{error.column}
                </span>
              )}
              <p className="text-foreground">{error.message}</p>
            </div>
          </div>
        ))}

        {/* Warnings */}
        {warnings.map((warning, i) => (
          <div key={i} className="mb-2 flex items-start gap-2 text-yellow-500">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        ))}

        {/* Success message */}
        {compileStatus === 'success' && (
          <div className="mb-2 flex items-start gap-2 text-green-500">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Compilation successful</span>
              {compileResult && (
                <p className="text-muted-foreground">
                  Bytecode: {compileResult.bytecode.length} bytes |{' '}
                  Time: {compileResult.compileTime}ms
                </p>
              )}
            </div>
          </div>
        )}

        {/* Initial message */}
        {compileStatus === 'idle' && errors.length === 0 && (
          <div className="text-muted-foreground">
            <p>Ready to compile. Press Ctrl+B or click Compile.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  const renderABI = () => (
    <ScrollArea className="h-full">
      <div className="p-4">
        {compileResult?.abi ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Circuit ABI</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(compileResult.abi, null, 2),
                      'abi'
                    )
                  }
                >
                  {copied === 'abi' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      JSON.stringify(compileResult.abi, null, 2),
                      'circuit-abi.json'
                    )
                  }
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Parameters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Parameters</h4>
              <div className="space-y-2">
                {compileResult.abi.parameters.map((param, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded bg-muted/50"
                  >
                    <Badge
                      variant={
                        param.visibility === 'public' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {param.visibility}
                    </Badge>
                    <span className="font-mono text-sm">{param.name}</span>
                    <span className="text-muted-foreground text-sm">
                      : {param.type.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON */}
            <div>
              <h4 className="text-sm font-medium mb-2">Raw JSON</h4>
              <pre className="p-2 rounded bg-muted/50 text-xs overflow-x-auto">
                {JSON.stringify(compileResult.abi, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Compile a circuit to see its ABI.
          </p>
        )}
      </div>
    </ScrollArea>
  );

  const renderProof = () => (
    <ScrollArea className="h-full">
      <div className="p-4">
        {proofResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Generated Proof</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(bytesToHex(proofResult.proof), 'proof')
                  }
                >
                  {copied === 'proof' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(proofResult.proof, 'proof.bin')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Proof info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded bg-muted/50">
                <p className="text-xs text-muted-foreground">Proof Size</p>
                <p className="font-medium">{proofResult.proofSize} bytes</p>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <p className="text-xs text-muted-foreground">Proving Time</p>
                <p className="font-medium">{proofResult.provingTime}ms</p>
              </div>
            </div>

            {/* Public inputs */}
            {proofResult.publicInputs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Public Inputs</h4>
                <div className="space-y-1">
                  {proofResult.publicInputs.map((input, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded bg-muted/50 font-mono text-xs"
                    >
                      <span className="text-muted-foreground">[{i}]</span>
                      <span className="truncate">{input}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification result */}
            {verificationResult && (
              <div
                className={cn(
                  'p-3 rounded border',
                  verificationResult.isValid
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-red-500/10 border-red-500'
                )}
              >
                <div className="flex items-center gap-2">
                  {verificationResult.isValid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-500">
                        Proof Valid
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-red-500">
                        Proof Invalid
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Verification time: {verificationResult.verificationTime}ms
                </p>
              </div>
            )}

            {/* Proof hex */}
            <div>
              <h4 className="text-sm font-medium mb-2">Proof (Hex)</h4>
              <pre className="p-2 rounded bg-muted/50 text-xs break-all whitespace-pre-wrap">
                {bytesToHex(proofResult.proof).substring(0, 500)}
                {proofResult.proof.length > 250 && '...'}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Generate a proof to see it here.
          </p>
        )}
      </div>
    </ScrollArea>
  );

  const renderVK = () => (
    <ScrollArea className="h-full">
      <div className="p-4">
        {proofResult?.verificationKey ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Verification Key</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      bytesToHex(proofResult.verificationKey),
                      'vk'
                    )
                  }
                >
                  {copied === 'vk' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(proofResult.verificationKey, 'vk.bin')
                  }
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">VK Size</p>
              <p className="font-medium">
                {proofResult.verificationKey.length} bytes
              </p>
            </div>

            <pre className="p-2 rounded bg-muted/50 text-xs break-all whitespace-pre-wrap">
              {bytesToHex(proofResult.verificationKey).substring(0, 500)}
              {proofResult.verificationKey.length > 250 && '...'}
            </pre>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Generate a proof to see the verification key.
          </p>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="console"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <Terminal className="h-4 w-4 mr-2" />
          Console
          {errors.length > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 px-1.5">
              {errors.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="abi"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <FileJson className="h-4 w-4 mr-2" />
          ABI
        </TabsTrigger>
        <TabsTrigger
          value="proof"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <Shield className="h-4 w-4 mr-2" />
          Proof
        </TabsTrigger>
        <TabsTrigger
          value="vk"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <Key className="h-4 w-4 mr-2" />
          VK
        </TabsTrigger>
      </TabsList>

      <TabsContent value="console" className="flex-1 m-0">
        {renderConsole()}
      </TabsContent>
      <TabsContent value="abi" className="flex-1 m-0">
        {renderABI()}
      </TabsContent>
      <TabsContent value="proof" className="flex-1 m-0">
        {renderProof()}
      </TabsContent>
      <TabsContent value="vk" className="flex-1 m-0">
        {renderVK()}
      </TabsContent>
    </Tabs>
  );
}
