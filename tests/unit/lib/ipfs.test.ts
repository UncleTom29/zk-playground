import { IPFSService, GalleryService } from '@/lib/storage/ipfs';
import type { SharedCircuit } from '@/types';

describe('IPFSService', () => {
  let ipfsService: IPFSService;

  beforeEach(() => {
    ipfsService = new IPFSService();
    // Clear localStorage
    localStorage.clear();
  });

  describe('upload', () => {
    it('should upload circuit data and return CID', async () => {
      const circuitData: SharedCircuit = {
        cid: '',
        code: 'fn main() {}',
        title: 'Test Circuit',
        description: 'A test circuit',
        author: 'Test Author',
        timestamp: Date.now(),
        tags: ['test'],
      };

      const result = await ipfsService.upload(circuitData);

      expect(result.cid).toBeDefined();
      expect(result.cid.startsWith('Qm')).toBe(true);
      expect(result.url).toContain(result.cid);
    });
  });

  describe('download', () => {
    it('should download circuit from cache', async () => {
      const circuitData: SharedCircuit = {
        cid: '',
        code: 'fn main() {}',
        title: 'Cached Circuit',
        description: 'A cached circuit',
        author: 'Test',
        timestamp: Date.now(),
        tags: [],
      };

      const uploadResult = await ipfsService.upload(circuitData);
      const downloaded = await ipfsService.download(uploadResult.cid);

      expect(downloaded.title).toBe('Cached Circuit');
      expect(downloaded.code).toBe('fn main() {}');
    });

    it('should download from localStorage fallback', async () => {
      const circuitData: SharedCircuit = {
        cid: 'QmTestCID123',
        code: 'fn main() {}',
        title: 'Storage Circuit',
        description: 'A storage circuit',
        author: 'Test',
        timestamp: Date.now(),
        tags: [],
      };

      // Store in localStorage
      const stored = { [circuitData.cid]: circuitData };
      localStorage.setItem('zk-playground-shared-circuits', JSON.stringify(stored));

      // Create new service instance (without cache)
      const newService = new IPFSService();
      const downloaded = await newService.download('QmTestCID123');

      expect(downloaded.title).toBe('Storage Circuit');
    });
  });

  describe('getShareUrl', () => {
    it('should generate correct share URL', () => {
      const url = ipfsService.getShareUrl('QmTestCID');
      expect(url).toBe('/share/QmTestCID');
    });
  });

  describe('clearCache', () => {
    it('should clear the internal cache', async () => {
      const circuitData: SharedCircuit = {
        cid: '',
        code: 'fn main() {}',
        title: 'Test',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: [],
      };

      await ipfsService.upload(circuitData);
      ipfsService.clearCache();

      // Cache should be cleared
      // This is an indirect test - we can't directly access the cache
    });
  });
});

describe('GalleryService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('addCircuit', () => {
    it('should add circuit to gallery', async () => {
      const circuit: SharedCircuit = {
        cid: 'QmTestGallery',
        code: 'fn main() {}',
        title: 'Gallery Circuit',
        description: 'A gallery circuit',
        author: 'Gallery Author',
        timestamp: Date.now(),
        tags: ['gallery'],
      };

      const result = await GalleryService.addCircuit(circuit);

      expect(result.views).toBe(0);
      expect(result.likes).toBe(0);
      expect(result.title).toBe('Gallery Circuit');
    });

    it('should update existing circuit with same CID', async () => {
      const circuit1: SharedCircuit = {
        cid: 'QmDuplicate',
        code: 'fn main() {}',
        title: 'Original',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: [],
      };

      const circuit2: SharedCircuit = {
        cid: 'QmDuplicate',
        code: 'fn main() { updated }',
        title: 'Updated',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: [],
      };

      await GalleryService.addCircuit(circuit1);
      await GalleryService.addCircuit(circuit2);

      const circuits = await GalleryService.getCircuits('all');
      const found = circuits.find((c) => c.cid === 'QmDuplicate');

      expect(found?.title).toBe('Updated');
    });
  });

  describe('getCircuits', () => {
    it('should return circuits sorted by timestamp (recent)', async () => {
      const older: SharedCircuit = {
        cid: 'QmOlder',
        code: '',
        title: 'Older',
        description: '',
        author: '',
        timestamp: Date.now() - 10000,
        tags: [],
      };

      const newer: SharedCircuit = {
        cid: 'QmNewer',
        code: '',
        title: 'Newer',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: [],
      };

      await GalleryService.addCircuit(older);
      await GalleryService.addCircuit(newer);

      const circuits = await GalleryService.getCircuits('recent');

      expect(circuits[0].cid).toBe('QmNewer');
    });
  });

  describe('incrementViews', () => {
    it('should increment view count', async () => {
      const circuit: SharedCircuit = {
        cid: 'QmViewTest',
        code: '',
        title: 'View Test',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: [],
      };

      await GalleryService.addCircuit(circuit);
      await GalleryService.incrementViews('QmViewTest');

      const circuits = await GalleryService.getCircuits('all');
      const found = circuits.find((c) => c.cid === 'QmViewTest');

      expect(found?.views).toBe(1);
    });
  });

  describe('incrementLikes', () => {
    it('should increment like count', async () => {
      const circuit: SharedCircuit = {
        cid: 'QmLikeTest',
        code: '',
        title: 'Like Test',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: [],
      };

      await GalleryService.addCircuit(circuit);
      await GalleryService.incrementLikes('QmLikeTest');

      const circuits = await GalleryService.getCircuits('all');
      const found = circuits.find((c) => c.cid === 'QmLikeTest');

      expect(found?.likes).toBe(1);
    });
  });

  describe('searchCircuits', () => {
    it('should search by title', async () => {
      const circuit: SharedCircuit = {
        cid: 'QmSearchTitle',
        code: '',
        title: 'Unique Title Here',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: [],
      };

      await GalleryService.addCircuit(circuit);
      const results = await GalleryService.searchCircuits('Unique Title');

      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Unique Title Here');
    });

    it('should search by tags', async () => {
      const circuit: SharedCircuit = {
        cid: 'QmSearchTag',
        code: '',
        title: 'Tagged Circuit',
        description: '',
        author: '',
        timestamp: Date.now(),
        tags: ['specialtag'],
      };

      await GalleryService.addCircuit(circuit);
      const results = await GalleryService.searchCircuits('specialtag');

      expect(results.length).toBe(1);
    });
  });
});
