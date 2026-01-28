import {
  tutorials,
  getTutorialById,
  getLessonById,
  getNextLesson,
  getPreviousLesson,
  getTutorialProgress,
} from '@/lib/tutorials/tutorialData';
import { runTests, validateRequirements, checkSolutionSimilarity } from '@/lib/tutorials/testRunner';

describe('Tutorial Data', () => {
  describe('tutorials array', () => {
    it('should have at least 3 tutorials', () => {
      expect(tutorials.length).toBeGreaterThanOrEqual(3);
    });

    it('should have all required properties', () => {
      tutorials.forEach((tutorial) => {
        expect(tutorial.id).toBeDefined();
        expect(tutorial.title).toBeDefined();
        expect(tutorial.description).toBeDefined();
        expect(tutorial.difficulty).toBeDefined();
        expect(tutorial.estimatedTime).toBeDefined();
        expect(tutorial.lessons).toBeDefined();
        expect(Array.isArray(tutorial.lessons)).toBe(true);
        expect(tutorial.lessons.length).toBeGreaterThan(0);
      });
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      tutorials.forEach((tutorial) => {
        expect(validDifficulties).toContain(tutorial.difficulty);
      });
    });

    it('should have unique IDs', () => {
      const ids = tutorials.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('lesson structure', () => {
    it('all lessons should have required properties', () => {
      tutorials.forEach((tutorial) => {
        tutorial.lessons.forEach((lesson) => {
          expect(lesson.id).toBeDefined();
          expect(lesson.title).toBeDefined();
          expect(lesson.content).toBeDefined();
          expect(lesson.starterCode).toBeDefined();
          expect(lesson.solution).toBeDefined();
          expect(lesson.hints).toBeDefined();
          expect(Array.isArray(lesson.hints)).toBe(true);
        });
      });
    });

    it('lessons with challenges should have test cases', () => {
      tutorials.forEach((tutorial) => {
        tutorial.lessons.forEach((lesson) => {
          if (lesson.challenge) {
            expect(lesson.challenge.description).toBeDefined();
            expect(lesson.challenge.testCases).toBeDefined();
            expect(lesson.challenge.testCases.length).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  describe('getTutorialById', () => {
    it('should return tutorial when found', () => {
      const tutorial = getTutorialById('intro-to-zk');
      expect(tutorial).toBeDefined();
      expect(tutorial?.title).toContain('Zero-Knowledge');
    });

    it('should return undefined when not found', () => {
      const tutorial = getTutorialById('nonexistent');
      expect(tutorial).toBeUndefined();
    });
  });

  describe('getLessonById', () => {
    it('should return lesson when found', () => {
      const lesson = getLessonById('intro-to-zk', 'intro-1-what-is-zk');
      expect(lesson).toBeDefined();
    });

    it('should return undefined for invalid tutorial', () => {
      const lesson = getLessonById('nonexistent', 'some-lesson');
      expect(lesson).toBeUndefined();
    });

    it('should return undefined for invalid lesson', () => {
      const lesson = getLessonById('intro-to-zk', 'nonexistent');
      expect(lesson).toBeUndefined();
    });
  });

  describe('getNextLesson', () => {
    it('should return next lesson', () => {
      const tutorial = getTutorialById('intro-to-zk');
      if (tutorial && tutorial.lessons.length > 1) {
        const firstLessonId = tutorial.lessons[0].id;
        const nextLesson = getNextLesson('intro-to-zk', firstLessonId);
        expect(nextLesson).toBeDefined();
        expect(nextLesson?.id).toBe(tutorial.lessons[1].id);
      }
    });

    it('should return undefined for last lesson', () => {
      const tutorial = getTutorialById('intro-to-zk');
      if (tutorial) {
        const lastLessonId = tutorial.lessons[tutorial.lessons.length - 1].id;
        const nextLesson = getNextLesson('intro-to-zk', lastLessonId);
        expect(nextLesson).toBeUndefined();
      }
    });
  });

  describe('getPreviousLesson', () => {
    it('should return previous lesson', () => {
      const tutorial = getTutorialById('intro-to-zk');
      if (tutorial && tutorial.lessons.length > 1) {
        const secondLessonId = tutorial.lessons[1].id;
        const prevLesson = getPreviousLesson('intro-to-zk', secondLessonId);
        expect(prevLesson).toBeDefined();
        expect(prevLesson?.id).toBe(tutorial.lessons[0].id);
      }
    });

    it('should return undefined for first lesson', () => {
      const tutorial = getTutorialById('intro-to-zk');
      if (tutorial) {
        const firstLessonId = tutorial.lessons[0].id;
        const prevLesson = getPreviousLesson('intro-to-zk', firstLessonId);
        expect(prevLesson).toBeUndefined();
      }
    });
  });

  describe('getTutorialProgress', () => {
    it('should calculate progress correctly', () => {
      const tutorial = getTutorialById('intro-to-zk');
      if (tutorial) {
        const progress = getTutorialProgress('intro-to-zk', [tutorial.lessons[0].id]);
        const expectedProgress = Math.round((1 / tutorial.lessons.length) * 100);
        expect(progress).toBe(expectedProgress);
      }
    });

    it('should return 0 for no completed lessons', () => {
      const progress = getTutorialProgress('intro-to-zk', []);
      expect(progress).toBe(0);
    });

    it('should return 0 for invalid tutorial', () => {
      const progress = getTutorialProgress('nonexistent', []);
      expect(progress).toBe(0);
    });
  });
});

describe('Test Runner', () => {
  describe('runTests', () => {
    it('should run tests and return results', async () => {
      const result = await runTests({
        code: `fn main(x: Field, y: pub Field) {
          assert(x * x == y);
        }`,
        challenge: {
          description: 'Test challenge',
          testCases: [
            { inputs: { x: '3', y: '9' }, description: 'Valid', shouldPass: true },
          ],
          requirements: ['Use assert'],
        },
      });

      expect(result.passed).toBeDefined();
      expect(result.totalTests).toBe(1);
      expect(result.results).toHaveLength(1);
    });

    it('should fail for missing main function', async () => {
      const result = await runTests({
        code: `let x = 5;`,
        challenge: {
          description: 'Test',
          testCases: [{ inputs: {}, description: 'Test', shouldPass: true }],
          requirements: [],
        },
      });

      expect(result.passed).toBe(false);
    });

    it('should call progress callback', async () => {
      const progressCalls: number[] = [];

      await runTests({
        code: `fn main() { assert(true); }`,
        challenge: {
          description: 'Test',
          testCases: [
            { inputs: {}, description: 'Test 1', shouldPass: true },
            { inputs: {}, description: 'Test 2', shouldPass: true },
          ],
          requirements: [],
        },
        onProgress: (current) => progressCalls.push(current),
      });

      expect(progressCalls.length).toBe(2);
    });
  });

  describe('validateRequirements', () => {
    it('should validate assert requirement', () => {
      const result = validateRequirements('fn main() { assert(x == y); }', [
        'Use assert statement',
      ]);
      expect(result.valid).toBe(true);
    });

    it('should detect missing assert', () => {
      const result = validateRequirements('fn main() { let x = 5; }', [
        'Use assert statement',
      ]);
      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });

    it('should validate hash requirement', () => {
      const result = validateRequirements(
        'use std::hash::poseidon; fn main() { poseidon::hash(); }',
        ['Use hash function']
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('checkSolutionSimilarity', () => {
    it('should return high similarity for identical code', () => {
      const code = 'fn main() { assert(x == y); }';
      const result = checkSolutionSimilarity(code, code);
      expect(result.similarity).toBeGreaterThanOrEqual(0.9);
    });

    it('should return feedback based on similarity', () => {
      const userCode = 'fn main() { assert(x == y); }';
      const solution = 'fn main() { assert(x == y); }';
      const result = checkSolutionSimilarity(userCode, solution);
      expect(result.feedback).toBeDefined();
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const result = checkSolutionSimilarity(
        'fn MAIN() { ASSERT(x == y); }',
        'fn main() { assert(x == y); }'
      );
      expect(result.similarity).toBeGreaterThan(0.5);
    });
  });
});
