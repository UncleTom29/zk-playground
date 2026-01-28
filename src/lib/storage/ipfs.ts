import type { SharedCircuit, GalleryCircuit } from '@/types';

// IPFS Gateway URLs
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

// Infura IPFS API (free tier)
const INFURA_IPFS_API = 'https://ipfs.infura.io:5001/api/v0';

export interface IPFSConfig {
  projectId?: string;
  projectSecret?: string;
}

export interface UploadResult {
  cid: string;
  url: string;
}

export class IPFSService {
  private config: IPFSConfig;
  private cache: Map<string, SharedCircuit> = new Map();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  constructor(config: IPFSConfig = {}) {
    this.config = {
      projectId: config.projectId || process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
      projectSecret: config.projectSecret || process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET,
    };
  }

  private getAuthHeader(): string | null {
    if (this.config.projectId && this.config.projectSecret) {
      const auth = Buffer.from(
        `${this.config.projectId}:${this.config.projectSecret}`
      ).toString('base64');
      return `Basic ${auth}`;
    }
    return null;
  }

  async upload(data: SharedCircuit): Promise<UploadResult> {
    const content = JSON.stringify(data);
    const blob = new Blob([content], { type: 'application/json' });

    // Try Infura IPFS first
    try {
      const formData = new FormData();
      formData.append('file', blob, 'circuit.json');

      const headers: HeadersInit = {};
      const authHeader = this.getAuthHeader();
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const response = await fetch(`${INFURA_IPFS_API}/add`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const cid = result.Hash;

      // Cache the uploaded data
      this.cache.set(cid, data);

      return {
        cid,
        url: `${IPFS_GATEWAYS[0]}${cid}`,
      };
    } catch (error) {
      console.error('Infura IPFS upload failed:', error);

      // Fallback: Create a mock CID for development/testing
      // In production, you would want proper error handling
      const mockCid = `Qm${this.generateMockHash(content)}`;

      // Store in local storage as fallback
      try {
        const stored = localStorage.getItem('zk-playground-shared-circuits') || '{}';
        const circuits = JSON.parse(stored);
        circuits[mockCid] = data;
        localStorage.setItem('zk-playground-shared-circuits', JSON.stringify(circuits));
      } catch {
        // Ignore localStorage errors
      }

      this.cache.set(mockCid, data);

      return {
        cid: mockCid,
        url: `${window.location.origin}/share/${mockCid}`,
      };
    }
  }

  async download(cid: string): Promise<SharedCircuit> {
    // Check cache first
    const cached = this.cache.get(cid);
    if (cached) {
      return cached;
    }

    // Check localStorage fallback
    try {
      const stored = localStorage.getItem('zk-playground-shared-circuits') || '{}';
      const circuits = JSON.parse(stored);
      if (circuits[cid]) {
        this.cache.set(cid, circuits[cid]);
        return circuits[cid];
      }
    } catch {
      // Ignore localStorage errors
    }

    // Try IPFS gateways
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const response = await fetch(`${gateway}${cid}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          this.cache.set(cid, data);
          return data;
        }
      } catch (error) {
        console.warn(`Gateway ${gateway} failed:`, error);
        continue;
      }
    }

    throw new Error(`Failed to fetch circuit from IPFS: ${cid}`);
  }

  async pin(cid: string): Promise<boolean> {
    try {
      const headers: HeadersInit = {};
      const authHeader = this.getAuthHeader();
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const response = await fetch(`${INFURA_IPFS_API}/pin/add?arg=${cid}`, {
        method: 'POST',
        headers,
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to pin:', error);
      return false;
    }
  }

  getIPFSUrl(cid: string): string {
    return `${IPFS_GATEWAYS[0]}${cid}`;
  }

  getShareUrl(cid: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/share/${cid}`;
    }
    return `/share/${cid}`;
  }

  private generateMockHash(content: string): string {
    // Simple hash for mock CIDs (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(44, '0').slice(0, 44);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
let ipfsInstance: IPFSService | null = null;

export function getIPFSService(config?: IPFSConfig): IPFSService {
  if (!ipfsInstance) {
    ipfsInstance = new IPFSService(config);
  }
  return ipfsInstance;
}

// Gallery service (using in-memory + localStorage for MVP)
export class GalleryService {
  private static STORAGE_KEY = 'zk-playground-gallery';

  static async getCircuits(
    filter: 'recent' | 'popular' | 'all' = 'recent',
    limit: number = 20
  ): Promise<GalleryCircuit[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || '[]';
      let circuits: GalleryCircuit[] = JSON.parse(stored);

      // Sort based on filter
      switch (filter) {
        case 'recent':
          circuits.sort((a, b) => b.timestamp - a.timestamp);
          break;
        case 'popular':
          circuits.sort((a, b) => (b.views + b.likes) - (a.views + a.likes));
          break;
        default:
          break;
      }

      return circuits.slice(0, limit);
    } catch {
      return [];
    }
  }

  static async addCircuit(circuit: SharedCircuit): Promise<GalleryCircuit> {
    const galleryCircuit: GalleryCircuit = {
      ...circuit,
      views: 0,
      likes: 0,
    };

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || '[]';
      const circuits: GalleryCircuit[] = JSON.parse(stored);

      // Check for duplicates
      const existing = circuits.findIndex((c) => c.cid === circuit.cid);
      if (existing >= 0) {
        circuits[existing] = galleryCircuit;
      } else {
        circuits.unshift(galleryCircuit);
      }

      // Keep only last 100 circuits
      const trimmed = circuits.slice(0, 100);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));

      return galleryCircuit;
    } catch {
      return galleryCircuit;
    }
  }

  static async incrementViews(cid: string): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || '[]';
      const circuits: GalleryCircuit[] = JSON.parse(stored);

      const circuit = circuits.find((c) => c.cid === cid);
      if (circuit) {
        circuit.views++;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(circuits));
      }
    } catch {
      // Ignore errors
    }
  }

  static async incrementLikes(cid: string): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || '[]';
      const circuits: GalleryCircuit[] = JSON.parse(stored);

      const circuit = circuits.find((c) => c.cid === cid);
      if (circuit) {
        circuit.likes++;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(circuits));
      }
    } catch {
      // Ignore errors
    }
  }

  static async searchCircuits(query: string): Promise<GalleryCircuit[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || '[]';
      const circuits: GalleryCircuit[] = JSON.parse(stored);

      const lowerQuery = query.toLowerCase();
      return circuits.filter(
        (c) =>
          c.title.toLowerCase().includes(lowerQuery) ||
          c.description.toLowerCase().includes(lowerQuery) ||
          c.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    } catch {
      return [];
    }
  }
}

export default IPFSService;
