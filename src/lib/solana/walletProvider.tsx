'use client';

import { useMemo, type ReactNode } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { DeploymentNetwork } from '@/stores/deploymentStore';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
  network?: DeploymentNetwork;
}

const NETWORK_ENDPOINTS: Record<DeploymentNetwork, string> = {
  devnet: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
  'mainnet-beta': clusterApiUrl('mainnet-beta'),
  testnet: clusterApiUrl('testnet'),
};

export function SolanaWalletProvider({
  children,
  network = 'devnet',
}: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => NETWORK_ENDPOINTS[network], [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default SolanaWalletProvider;
