import { act, renderHook } from '@testing-library/react';
import { useTutorialStore } from '@/stores/tutorialStore';

describe('Tutorial Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useTutorialStore());
    act(() => {
      result.current.progress.forEach((p) => {
        result.current.resetTutorialProgress(p.tutorialId);
      });
    });
  });

  describe('startTutorial', () => {
    it('should start a new tutorial', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
      });

      expect(result.current.currentTutorialId).toBe('test-tutorial');
      expect(result.current.currentLessonId).toBe('lesson-1');
      expect(result.current.progress.length).toBeGreaterThan(0);
    });

    it('should not duplicate progress for same tutorial', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.startTutorial('test-tutorial', 'lesson-1');
      });

      const tutorialProgress = result.current.progress.filter(
        (p) => p.tutorialId === 'test-tutorial'
      );
      expect(tutorialProgress.length).toBe(1);
    });
  });

  describe('setCurrentLesson', () => {
    it('should update current lesson', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.setCurrentLesson('test-tutorial', 'lesson-2');
      });

      expect(result.current.currentLessonId).toBe('lesson-2');
    });

    it('should update progress current lesson', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.setCurrentLesson('test-tutorial', 'lesson-2');
      });

      const progress = result.current.getTutorialProgress('test-tutorial');
      expect(progress?.currentLesson).toBe('lesson-2');
    });
  });

  describe('completeLesson', () => {
    it('should mark lesson as completed', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.completeLesson('test-tutorial', 'lesson-1');
      });

      expect(result.current.isLessonCompleted('test-tutorial', 'lesson-1')).toBe(true);
    });

    it('should not duplicate completed lessons', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.completeLesson('test-tutorial', 'lesson-1');
        result.current.completeLesson('test-tutorial', 'lesson-1');
      });

      const progress = result.current.getTutorialProgress('test-tutorial');
      expect(progress?.completedLessons.length).toBe(1);
    });
  });

  describe('completeTutorial', () => {
    it('should mark tutorial as completed', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.completeTutorial('test-tutorial');
      });

      expect(result.current.isTutorialCompleted('test-tutorial')).toBe(true);
    });

    it('should set completedAt timestamp', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.completeTutorial('test-tutorial');
      });

      const progress = result.current.getTutorialProgress('test-tutorial');
      expect(progress?.completedAt).toBeDefined();
    });
  });

  describe('resetTutorialProgress', () => {
    it('should remove tutorial progress', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.completeLesson('test-tutorial', 'lesson-1');
        result.current.resetTutorialProgress('test-tutorial');
      });

      expect(result.current.getTutorialProgress('test-tutorial')).toBeUndefined();
    });

    it('should clear current tutorial if matching', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.resetTutorialProgress('test-tutorial');
      });

      expect(result.current.currentTutorialId).toBeNull();
    });
  });

  describe('setTutorialCode', () => {
    it('should update tutorial code', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.setTutorialCode('fn main() { }');
      });

      expect(result.current.tutorialCode).toBe('fn main() { }');
    });
  });

  describe('test results', () => {
    it('should set and clear test results', () => {
      const { result } = renderHook(() => useTutorialStore());

      const testResults = [
        {
          testCase: 'Test 1',
          description: 'Test description',
          passed: true,
          inputs: {},
          expectedPass: true,
        },
      ];

      act(() => {
        result.current.setTestResults(testResults);
      });

      expect(result.current.testResults).toEqual(testResults);

      act(() => {
        result.current.clearTestResults();
      });

      expect(result.current.testResults).toEqual([]);
    });

    it('should track running tests state', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.setIsRunningTests(true);
      });

      expect(result.current.isRunningTests).toBe(true);

      act(() => {
        result.current.setIsRunningTests(false);
      });

      expect(result.current.isRunningTests).toBe(false);
    });
  });

  describe('getCompletedLessonsCount', () => {
    it('should return correct count', () => {
      const { result } = renderHook(() => useTutorialStore());

      act(() => {
        result.current.startTutorial('test-tutorial', 'lesson-1');
        result.current.completeLesson('test-tutorial', 'lesson-1');
        result.current.completeLesson('test-tutorial', 'lesson-2');
      });

      expect(result.current.getCompletedLessonsCount('test-tutorial')).toBe(2);
    });

    it('should return 0 for nonexistent tutorial', () => {
      const { result } = renderHook(() => useTutorialStore());

      expect(result.current.getCompletedLessonsCount('nonexistent')).toBe(0);
    });
  });
});
