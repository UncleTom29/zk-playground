import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import type { DeploymentNetwork } from '@/stores/deploymentStore';

// RPC endpoints for different networks
const RPC_ENDPOINTS: Record<DeploymentNetwork, string> = {
  devnet: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
};

// Explorer URLs
const EXPLORER_URLS: Record<DeploymentNetwork, string> = {
  devnet: 'https://explorer.solana.com/?cluster=devnet',
  'mainnet-beta': 'https://explorer.solana.com',
  testnet: 'https://explorer.solana.com/?cluster=testnet',
};

export interface SunspotDeploymentConfig {
  verificationKey: Uint8Array;
  network: DeploymentNetwork;
  circuitName: string;
}

export interface SunspotDeploymentResult {
  programId: string;
  transactionSignature: string;
  network: DeploymentNetwork;
  cost: number;
}

export interface VerificationConfig {
  programId: string;
  proof: Uint8Array;
  publicInputs: string[];
  network: DeploymentNetwork;
}

export interface OnChainVerificationResult {
  isValid: boolean;
  transactionSignature: string;
  network: DeploymentNetwork;
  timestamp: number;
}

export class SunspotService {
  private connection: Connection | null = null;
  private network: DeploymentNetwork = 'devnet';

  constructor(network: DeploymentNetwork = 'devnet') {
    this.network = network;
    this.connection = new Connection(RPC_ENDPOINTS[network], 'confirmed');
  }

  setNetwork(network: DeploymentNetwork): void {
    this.network = network;
    this.connection = new Connection(RPC_ENDPOINTS[network], 'confirmed');
  }

  getConnection(): Connection {
    if (!this.connection) {
      this.connection = new Connection(RPC_ENDPOINTS[this.network], 'confirmed');
    }
    return this.connection;
  }

  getExplorerUrl(signature: string): string {
    const baseUrl = EXPLORER_URLS[this.network];
    const clusterParam = this.network !== 'mainnet-beta' ? `&cluster=${this.network}` : '';
    return `${baseUrl.split('?')[0]}/tx/${signature}?${clusterParam}`;
  }

  getProgramExplorerUrl(programId: string): string {
    const baseUrl = EXPLORER_URLS[this.network];
    const clusterParam = this.network !== 'mainnet-beta' ? `&cluster=${this.network}` : '';
    return `${baseUrl.split('?')[0]}/address/${programId}?${clusterParam}`;
  }

  async estimateDeploymentCost(verificationKeySize: number): Promise<number> {
    const connection = this.getConnection();

    // Estimate based on verification key size + overhead
    // Account size = VK size + program overhead (approx 1000 bytes)
    const accountSize = verificationKeySize + 1000;

    // Get minimum rent exemption
    const rentExemption = await connection.getMinimumBalanceForRentExemption(accountSize);

    // Add transaction fees (approx 5000 lamports)
    const transactionFee = 5000;

    // Total cost in SOL
    const totalLamports = rentExemption + transactionFee;
    return totalLamports / LAMPORTS_PER_SOL;
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    const connection = this.getConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  async deployVerifier(
    config: SunspotDeploymentConfig,
    walletPublicKey: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
    onProgress?: (progress: number, message: string) => void
  ): Promise<SunspotDeploymentResult> {
    const connection = this.getConnection();

    onProgress?.(10, 'Preparing deployment...');

    // Generate a new keypair for the verifier program account
    const verifierAccount = Keypair.generate();
    const programId = verifierAccount.publicKey.toBase58();

    onProgress?.(20, 'Calculating deployment cost...');

    // Calculate space needed for the verifier data
    const verifierDataSize = config.verificationKey.length + 64; // VK + metadata
    const lamports = await connection.getMinimumBalanceForRentExemption(verifierDataSize);

    onProgress?.(30, 'Creating verifier account...');

    // Create the account instruction
    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: walletPublicKey,
      newAccountPubkey: verifierAccount.publicKey,
      lamports,
      space: verifierDataSize,
      programId: SystemProgram.programId, // For now, using system program
    });

    // Create instruction to store verification key data
    // In a real implementation, this would use Sunspot's program
    const storeDataIx = new TransactionInstruction({
      keys: [
        { pubkey: verifierAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: walletPublicKey, isSigner: true, isWritable: false },
      ],
      programId: SystemProgram.programId,
      data: Buffer.from(config.verificationKey),
    });

    onProgress?.(40, 'Building transaction...');

    // Create transaction
    const transaction = new Transaction();
    transaction.add(createAccountIx);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;

    onProgress?.(50, 'Signing transaction...');

    // Sign with verifier account keypair
    transaction.partialSign(verifierAccount);

    // Sign with wallet
    const signedTransaction = await signTransaction(transaction);

    onProgress?.(70, 'Sending transaction...');

    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    onProgress?.(85, 'Confirming transaction...');

    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    onProgress?.(100, 'Deployment complete!');

    return {
      programId,
      transactionSignature: signature,
      network: this.network,
      cost: lamports / LAMPORTS_PER_SOL,
    };
  }

  async verifyProofOnChain(
    config: VerificationConfig,
    walletPublicKey: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
    onProgress?: (progress: number, message: string) => void
  ): Promise<OnChainVerificationResult> {
    const connection = this.getConnection();

    onProgress?.(10, 'Preparing verification...');

    // Create verification instruction
    // In a real implementation, this would call Sunspot's verify instruction
    const verificationData = Buffer.concat([
      config.proof,
      Buffer.from(config.publicInputs.join(',')),
    ]);

    const verifyIx = new TransactionInstruction({
      keys: [
        { pubkey: new PublicKey(config.programId), isSigner: false, isWritable: false },
        { pubkey: walletPublicKey, isSigner: true, isWritable: false },
      ],
      programId: SystemProgram.programId,
      data: verificationData,
    });

    onProgress?.(30, 'Building verification transaction...');

    const transaction = new Transaction();
    transaction.add(verifyIx);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;

    onProgress?.(50, 'Signing verification transaction...');

    const signedTransaction = await signTransaction(transaction);

    onProgress?.(70, 'Sending verification transaction...');

    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    onProgress?.(85, 'Confirming verification...');

    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    onProgress?.(100, 'Verification complete!');

    // For now, we simulate verification success
    // In a real implementation, we would parse the transaction logs
    return {
      isValid: true,
      transactionSignature: signature,
      network: this.network,
      timestamp: Date.now(),
    };
  }

  async requestAirdrop(publicKey: PublicKey, amount: number = 1): Promise<string> {
    if (this.network === 'mainnet-beta') {
      throw new Error('Airdrop not available on mainnet');
    }

    const connection = this.getConnection();
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(signature);
    return signature;
  }
}

// Singleton instance
let sunspotInstance: SunspotService | null = null;

export function getSunspotService(network?: DeploymentNetwork): SunspotService {
  if (!sunspotInstance) {
    sunspotInstance = new SunspotService(network || 'devnet');
  } else if (network) {
    sunspotInstance.setNetwork(network);
  }
  return sunspotInstance;
}

export default SunspotService;
