'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Trash2,
  Clock,
  Network,
  Wallet,
} from 'lucide-react';
import { useDeploymentStore, type DeploymentResult } from '@/stores/deploymentStore';

interface DeploymentResultCardProps {
  deployment: DeploymentResult;
  onVerify?: (deployment: DeploymentResult) => void;
}

export function DeploymentResultCard({
  deployment,
  onVerify,
}: DeploymentResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { removeDeployment } = useDeploymentStore();

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const getExplorerUrl = useCallback(
    (type: 'tx' | 'address', value: string) => {
      const baseUrl =
        deployment.network === 'mainnet-beta'
          ? 'https://explorer.solana.com'
          : `https://explorer.solana.com?cluster=${deployment.network}`;
      return `${baseUrl}/${type}/${value}`;
    },
    [deployment.network]
  );

  const getNetworkBadgeVariant = useCallback(() => {
    switch (deployment.network) {
      case 'mainnet-beta':
        return 'default';
      case 'devnet':
        return 'secondary';
      default:
        return 'outline';
    }
  }, [deployment.network]);

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {deployment.circuitName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getNetworkBadgeVariant()}>
              <Network className="h-3 w-3 mr-1" />
              {deployment.network}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeDeployment(deployment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove from history</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Program ID */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Program ID</span>
          <div className="flex items-center gap-2 p-2 rounded bg-muted">
            <code className="text-xs font-mono flex-1 truncate">
              {deployment.programId}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    copyToClipboard(deployment.programId, 'programId')
                  }
                >
                  {copiedField === 'programId' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy program ID</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                  <a
                    href={getExplorerUrl('address', deployment.programId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View on Explorer</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Transaction Signature */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Transaction</span>
          <div className="flex items-center gap-2 p-2 rounded bg-muted">
            <code className="text-xs font-mono flex-1 truncate">
              {deployment.transactionSignature}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    copyToClipboard(deployment.transactionSignature, 'tx')
                  }
                >
                  {copiedField === 'tx' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy transaction signature</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                  <a
                    href={getExplorerUrl('tx', deployment.transactionSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View on Explorer</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            {deployment.cost.toFixed(4)} SOL
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(deployment.timestamp)}
          </div>
        </div>

        {/* Actions */}
        {onVerify && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onVerify(deployment)}
          >
            Verify Proof On-Chain
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface DeploymentHistoryProps {
  onVerify?: (deployment: DeploymentResult) => void;
}

export function DeploymentHistory({ onVerify }: DeploymentHistoryProps) {
  const { deployments, clearDeployments } = useDeploymentStore();

  if (deployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Network className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium mb-2">No Deployments Yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Deploy your first verifier to Solana to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Deployment History</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={clearDeployments}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {deployments.map((deployment) => (
          <DeploymentResultCard
            key={deployment.id}
            deployment={deployment}
            onVerify={onVerify}
          />
        ))}
      </div>
    </div>
  );
}

export default DeploymentResultCard;
