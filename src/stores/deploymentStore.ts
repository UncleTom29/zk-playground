import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DeploymentNetwork = 'devnet' | 'mainnet-beta' | 'testnet';
export type DeploymentStatus = 'idle' | 'deploying' | 'success' | 'error';

export interface DeploymentResult {
  id: string;
  programId: string;
  transactionSignature: string;
  network: DeploymentNetwork;
  timestamp: number;
  circuitName: string;
  cost: number; // in SOL
}

export interface OnChainVerificationResult {
  isValid: boolean;
  transactionSignature: string;
  network: DeploymentNetwork;
  timestamp: number;
}

interface DeploymentState {
  // Network
  network: DeploymentNetwork;
  setNetwork: (network: DeploymentNetwork) => void;

  // Status
  status: DeploymentStatus;
  setStatus: (status: DeploymentStatus) => void;

  // Deployments history
  deployments: DeploymentResult[];
  addDeployment: (deployment: DeploymentResult) => void;
  removeDeployment: (id: string) => void;
  getDeployment: (id: string) => DeploymentResult | undefined;
  clearDeployments: () => void;

  // Current deployment
  currentDeployment: DeploymentResult | null;
  setCurrentDeployment: (deployment: DeploymentResult | null) => void;

  // Verification
  verificationResult: OnChainVerificationResult | null;
  setVerificationResult: (result: OnChainVerificationResult | null) => void;

  // Progress
  isDeploying: boolean;
  deployProgress: number;
  setDeployProgress: (progress: number) => void;

  // Error
  error: string | null;
  setError: (error: string | null) => void;

  // Cost estimation
  estimatedCost: number | null;
  setEstimatedCost: (cost: number | null) => void;

  // Actions
  startDeployment: () => void;
  finishDeployment: (result: DeploymentResult) => void;
  failDeployment: (error: string) => void;
  reset: () => void;
}

export const useDeploymentStore = create<DeploymentState>()(
  persist(
    (set, get) => ({
      // Initial state
      network: 'devnet',
      status: 'idle',
      deployments: [],
      currentDeployment: null,
      verificationResult: null,
      isDeploying: false,
      deployProgress: 0,
      error: null,
      estimatedCost: null,

      // Setters
      setNetwork: (network) => set({ network }),
      setStatus: (status) => set({ status }),
      addDeployment: (deployment) =>
        set((state) => ({
          deployments: [deployment, ...state.deployments],
        })),
      removeDeployment: (id) =>
        set((state) => ({
          deployments: state.deployments.filter((d) => d.id !== id),
        })),
      getDeployment: (id) => get().deployments.find((d) => d.id === id),
      clearDeployments: () => set({ deployments: [] }),
      setCurrentDeployment: (currentDeployment) => set({ currentDeployment }),
      setVerificationResult: (verificationResult) => set({ verificationResult }),
      setDeployProgress: (deployProgress) => set({ deployProgress }),
      setError: (error) => set({ error }),
      setEstimatedCost: (estimatedCost) => set({ estimatedCost }),

      // Actions
      startDeployment: () =>
        set({
          status: 'deploying',
          isDeploying: true,
          deployProgress: 0,
          error: null,
        }),

      finishDeployment: (result) =>
        set((state) => ({
          status: 'success',
          isDeploying: false,
          deployProgress: 100,
          currentDeployment: result,
          deployments: [result, ...state.deployments],
          error: null,
        })),

      failDeployment: (error) =>
        set({
          status: 'error',
          isDeploying: false,
          deployProgress: 0,
          error,
        }),

      reset: () =>
        set({
          status: 'idle',
          currentDeployment: null,
          verificationResult: null,
          isDeploying: false,
          deployProgress: 0,
          error: null,
          estimatedCost: null,
        }),
    }),
    {
      name: 'zk-playground-deployments',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        network: state.network,
        deployments: state.deployments,
      }),
    }
  )
);
