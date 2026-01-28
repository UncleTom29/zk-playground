'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  Network,
  DollarSign,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  AlertCircle,
} from 'lucide-react';
import {
  useDeploymentStore,
  type DeploymentNetwork,
} from '@/stores/deploymentStore';
import { useProverStore } from '@/stores/proverStore';
import { getSunspotService } from '@/lib/solana/sunspot';

interface DeploymentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WizardStep = 'network' | 'wallet' | 'review' | 'deploy' | 'complete';

export default function DeploymentWizard({
  open,
  onOpenChange,
}: DeploymentWizardProps) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [currentStep, setCurrentStep] = useState<WizardStep>('network');
  const [balance, setBalance] = useState<number | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    network,
    setNetwork,
    estimatedCost,
    setEstimatedCost,
    currentDeployment,
    startDeployment,
    finishDeployment,
    failDeployment,
    isDeploying,
  } = useDeploymentStore();

  const { proofResult } = useProverStore();

  // Fetch balance when wallet connects
  useEffect(() => {
    async function fetchBalance() {
      if (publicKey && connection) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch {
          setBalance(null);
        }
      }
    }
    fetchBalance();
  }, [publicKey, connection, network]);

  // Estimate deployment cost
  useEffect(() => {
    async function estimateCost() {
      if (proofResult?.verificationKey) {
        try {
          const sunspot = getSunspotService(network);
          const cost = await sunspot.estimateDeploymentCost(
            proofResult.verificationKey.length
          );
          setEstimatedCost(cost);
        } catch {
          setEstimatedCost(0.01); // Default estimate
        }
      }
    }
    estimateCost();
  }, [proofResult, network, setEstimatedCost]);

  const handleNetworkChange = useCallback(
    (value: string) => {
      setNetwork(value as DeploymentNetwork);
    },
    [setNetwork]
  );

  const handleDeploy = useCallback(async () => {
    if (!publicKey || !signTransaction || !proofResult?.verificationKey) {
      setError('Missing required data for deployment');
      return;
    }

    setError(null);
    startDeployment();
    setCurrentStep('deploy');

    try {
      const sunspot = getSunspotService(network);

      const result = await sunspot.deployVerifier(
        {
          verificationKey: proofResult.verificationKey,
          network,
          circuitName: 'ZK Circuit',
        },
        publicKey,
        signTransaction,
        (progress, message) => {
          setDeploymentProgress(progress);
          setProgressMessage(message);
        }
      );

      finishDeployment({
        id: crypto.randomUUID(),
        programId: result.programId,
        transactionSignature: result.transactionSignature,
        network: result.network,
        timestamp: Date.now(),
        circuitName: 'ZK Circuit',
        cost: result.cost,
      });

      setCurrentStep('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deployment failed';
      failDeployment(message);
      setError(message);
      setCurrentStep('review');
    }
  }, [
    publicKey,
    signTransaction,
    proofResult,
    network,
    startDeployment,
    finishDeployment,
    failDeployment,
  ]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const getExplorerUrl = useCallback(
    (type: 'tx' | 'address', value: string) => {
      const baseUrl =
        network === 'mainnet-beta'
          ? 'https://explorer.solana.com'
          : `https://explorer.solana.com?cluster=${network}`;
      return `${baseUrl}/${type}/${value}`;
    },
    [network]
  );

  const resetWizard = useCallback(() => {
    setCurrentStep('network');
    setDeploymentProgress(0);
    setProgressMessage('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!isDeploying) {
      resetWizard();
      onOpenChange(false);
    }
  }, [isDeploying, resetWizard, onOpenChange]);

  const renderStepIndicator = () => {
    const steps: WizardStep[] = ['network', 'wallet', 'review', 'deploy', 'complete'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.slice(0, 4).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index < currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : index === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentIndex ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderNetworkStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Network className="h-5 w-5" />
        <h3 className="font-semibold">Select Network</h3>
      </div>

      <Select value={network} onValueChange={handleNetworkChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="devnet">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Devnet</Badge>
              <span className="text-muted-foreground">For testing</span>
            </div>
          </SelectItem>
          <SelectItem value="testnet">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Testnet</Badge>
              <span className="text-muted-foreground">For staging</span>
            </div>
          </SelectItem>
          <SelectItem value="mainnet-beta">
            <div className="flex items-center gap-2">
              <Badge>Mainnet</Badge>
              <span className="text-muted-foreground">Production</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {network === 'mainnet-beta' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mainnet deployment uses real SOL. Make sure you understand the costs
            involved.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setCurrentStep('wallet')}>
          Continue
        </Button>
      </div>
    </div>
  );

  const renderWalletStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5" />
        <h3 className="font-semibold">Connect Wallet</h3>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <WalletMultiButton />

        {connected && publicKey && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="text-sm font-mono">
                {publicKey.toBase58().slice(0, 8)}...
                {publicKey.toBase58().slice(-8)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className="text-sm font-medium">
                {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('network')}>
          Back
        </Button>
        <Button onClick={() => setCurrentStep('review')} disabled={!connected}>
          Continue
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5" />
        <h3 className="font-semibold">Review Deployment</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <span className="text-sm text-muted-foreground">Network</span>
          <Badge variant={network === 'mainnet-beta' ? 'default' : 'secondary'}>
            {network}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <span className="text-sm text-muted-foreground">Estimated Cost</span>
          <span className="text-sm font-medium">
            {estimatedCost ? `~${estimatedCost.toFixed(4)} SOL` : 'Calculating...'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <span className="text-sm text-muted-foreground">
            Verification Key Size
          </span>
          <span className="text-sm font-medium">
            {proofResult?.verificationKey
              ? `${proofResult.verificationKey.length} bytes`
              : 'N/A'}
          </span>
        </div>

        {balance !== null && estimatedCost !== null && balance < estimatedCost && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Insufficient balance. You need at least {estimatedCost.toFixed(4)} SOL
              but only have {balance.toFixed(4)} SOL.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('wallet')}>
          Back
        </Button>
        <Button
          onClick={handleDeploy}
          disabled={
            !proofResult?.verificationKey ||
            (balance !== null && estimatedCost !== null && balance < estimatedCost)
          }
        >
          <Upload className="h-4 w-4 mr-2" />
          Deploy Verifier
        </Button>
      </div>
    </div>
  );

  const renderDeployStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="h-5 w-5 animate-spin" />
        <h3 className="font-semibold">Deploying...</h3>
      </div>

      <div className="space-y-3">
        <Progress value={deploymentProgress} className="h-2" />
        <p className="text-sm text-center text-muted-foreground">
          {progressMessage || 'Preparing deployment...'}
        </p>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Please confirm the transaction in your wallet
      </p>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
        <h3 className="font-semibold">Deployment Successful!</h3>
      </div>

      {currentDeployment && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted space-y-1">
            <span className="text-xs text-muted-foreground">Program ID</span>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono flex-1 truncate">
                {currentDeployment.programId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  copyToClipboard(currentDeployment.programId, 'programId')
                }
              >
                {copiedField === 'programId' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a
                  href={getExplorerUrl('address', currentDeployment.programId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted space-y-1">
            <span className="text-xs text-muted-foreground">Transaction</span>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono flex-1 truncate">
                {currentDeployment.transactionSignature}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  copyToClipboard(
                    currentDeployment.transactionSignature,
                    'signature'
                  )
                }
              >
                {copiedField === 'signature' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a
                  href={getExplorerUrl('tx', currentDeployment.transactionSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">Cost</span>
            <span className="text-sm font-medium">
              {currentDeployment.cost.toFixed(4)} SOL
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={handleClose}>Done</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy to Solana</DialogTitle>
          <DialogDescription>
            Deploy your ZK verifier to Solana blockchain
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        {currentStep === 'network' && renderNetworkStep()}
        {currentStep === 'wallet' && renderWalletStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'deploy' && renderDeployStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
}
