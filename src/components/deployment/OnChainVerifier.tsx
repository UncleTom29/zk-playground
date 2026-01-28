'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  Shield,
} from 'lucide-react';
import {
  useDeploymentStore,
  type DeploymentNetwork,
  type DeploymentResult,
} from '@/stores/deploymentStore';
import { useProverStore } from '@/stores/proverStore';
import { getSunspotService } from '@/lib/solana/sunspot';

interface OnChainVerifierProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OnChainVerifier({
  open,
  onOpenChange,
}: OnChainVerifierProps) {
  const { publicKey, signTransaction, connected } = useWallet();

  const [selectedDeployment, setSelectedDeployment] =
    useState<DeploymentResult | null>(null);
  const [customProgramId, setCustomProgramId] = useState('');
  const [useCustomProgram, setUseCustomProgram] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    transactionSignature: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { deployments, network, setNetwork } = useDeploymentStore();
  const { proofResult } = useProverStore();

  const handleNetworkChange = useCallback(
    (value: string) => {
      setNetwork(value as DeploymentNetwork);
      setSelectedDeployment(null);
    },
    [setNetwork]
  );

  const handleDeploymentSelect = useCallback(
    (deploymentId: string) => {
      const deployment = deployments.find((d) => d.id === deploymentId);
      if (deployment) {
        setSelectedDeployment(deployment);
        setUseCustomProgram(false);
        setCustomProgramId('');
      }
    },
    [deployments]
  );

  const getProgramId = useCallback((): string | null => {
    if (useCustomProgram) {
      return customProgramId.trim() || null;
    }
    return selectedDeployment?.programId || null;
  }, [useCustomProgram, customProgramId, selectedDeployment]);

  const handleVerify = useCallback(async () => {
    const programId = getProgramId();

    if (!publicKey || !signTransaction || !proofResult || !programId) {
      setError('Missing required data for verification');
      return;
    }

    setError(null);
    setIsVerifying(true);
    setVerificationResult(null);
    setVerificationProgress(0);

    try {
      const sunspot = getSunspotService(network);

      const result = await sunspot.verifyProofOnChain(
        {
          programId,
          proof: proofResult.proof,
          publicInputs: proofResult.publicInputs,
          network,
        },
        publicKey,
        signTransaction,
        (progress, message) => {
          setVerificationProgress(progress);
          setProgressMessage(message);
        }
      );

      setVerificationResult({
        isValid: result.isValid,
        transactionSignature: result.transactionSignature,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  }, [publicKey, signTransaction, proofResult, network, getProgramId]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const getExplorerUrl = useCallback(
    (signature: string) => {
      const baseUrl =
        network === 'mainnet-beta'
          ? 'https://explorer.solana.com'
          : `https://explorer.solana.com?cluster=${network}`;
      return `${baseUrl}/tx/${signature}`;
    },
    [network]
  );

  const resetVerifier = useCallback(() => {
    setVerificationResult(null);
    setVerificationProgress(0);
    setProgressMessage('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!isVerifying) {
      resetVerifier();
      onOpenChange(false);
    }
  }, [isVerifying, resetVerifier, onOpenChange]);

  const filteredDeployments = deployments.filter((d) => d.network === network);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            On-Chain Verification
          </DialogTitle>
          <DialogDescription>
            Verify your proof against a deployed verifier on Solana
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Network Selection */}
          <div className="space-y-2">
            <Label>Network</Label>
            <Select value={network} onValueChange={handleNetworkChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="devnet">Devnet</SelectItem>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="mainnet-beta">Mainnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wallet Connection */}
          {!connected && (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to verify on-chain
              </p>
              <WalletMultiButton />
            </div>
          )}

          {connected && (
            <>
              {/* Deployment Selection */}
              <div className="space-y-2">
                <Label>Select Verifier</Label>
                {filteredDeployments.length > 0 ? (
                  <Select
                    value={selectedDeployment?.id || ''}
                    onValueChange={handleDeploymentSelect}
                    disabled={useCustomProgram}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deployed verifier" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDeployments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">
                              {d.programId.slice(0, 8)}...{d.programId.slice(-8)}
                            </span>
                            <span className="text-muted-foreground">
                              ({d.circuitName})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No deployments found on {network}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="useCustomProgram"
                    checked={useCustomProgram}
                    onChange={(e) => {
                      setUseCustomProgram(e.target.checked);
                      if (e.target.checked) {
                        setSelectedDeployment(null);
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="useCustomProgram" className="text-sm">
                    Use custom program ID
                  </Label>
                </div>

                {useCustomProgram && (
                  <Input
                    placeholder="Enter program ID..."
                    value={customProgramId}
                    onChange={(e) => setCustomProgramId(e.target.value)}
                    className="font-mono text-sm"
                  />
                )}
              </div>

              {/* Proof Status */}
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Proof Status
                  </span>
                  {proofResult ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      No Proof
                    </Badge>
                  )}
                </div>
                {proofResult && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Proof size: {proofResult.proof.length} bytes |{' '}
                    {proofResult.publicInputs.length} public inputs
                  </p>
                )}
              </div>

              {/* Verification Progress */}
              {isVerifying && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Verifying...</span>
                  </div>
                  <Progress value={verificationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progressMessage}
                  </p>
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-lg ${
                    verificationResult.isValid
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {verificationResult.isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-green-500">
                          Proof Valid!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-semibold text-red-500">
                          Proof Invalid
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Transaction
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono flex-1 truncate">
                        {verificationResult.transactionSignature}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(
                            verificationResult.transactionSignature,
                            'tx'
                          )
                        }
                      >
                        {copiedField === 'tx' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        asChild
                      >
                        <a
                          href={getExplorerUrl(
                            verificationResult.transactionSignature
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {verificationResult && (
                  <Button variant="outline" onClick={resetVerifier}>
                    Verify Again
                  </Button>
                )}
                <Button
                  onClick={handleVerify}
                  disabled={
                    isVerifying ||
                    !proofResult ||
                    (!selectedDeployment && !customProgramId.trim())
                  }
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify On-Chain
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
