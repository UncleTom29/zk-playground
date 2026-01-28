import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TutorialProgress } from '@/types';

interface TutorialState {
  // Progress tracking
  progress: TutorialProgress[];

  // Current tutorial state
  currentTutorialId: string | null;
  currentLessonId: string | null;

  // User's current code in tutorial
  tutorialCode: string;

  // Test results
  testResults: TestResult[];
  isRunningTests: boolean;

  // Actions
  startTutorial: (tutorialId: string, firstLessonId: string) => void;
  setCurrentLesson: (tutorialId: string, lessonId: string) => void;
  completeLesson: (tutorialId: string, lessonId: string) => void;
  completeTutorial: (tutorialId: string) => void;
  resetTutorialProgress: (tutorialId: string) => void;

  // Code management
  setTutorialCode: (code: string) => void;

  // Test management
  setTestResults: (results: TestResult[]) => void;
  setIsRunningTests: (running: boolean) => void;
  clearTestResults: () => void;

  // Queries
  getTutorialProgress: (tutorialId: string) => TutorialProgress | undefined;
  isLessonCompleted: (tutorialId: string, lessonId: string) => boolean;
  isTutorialCompleted: (tutorialId: string) => boolean;
  getCompletedLessonsCount: (tutorialId: string) => number;
}

export interface TestResult {
  testCase: string;
  description: string;
  passed: boolean;
  error?: string;
  inputs: Record<string, unknown>;
  expectedPass: boolean;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // Initial state
      progress: [],
      currentTutorialId: null,
      currentLessonId: null,
      tutorialCode: '',
      testResults: [],
      isRunningTests: false,

      // Start a tutorial
      startTutorial: (tutorialId, firstLessonId) => {
        const existing = get().progress.find(p => p.tutorialId === tutorialId);

        if (!existing) {
          set((state) => ({
            progress: [
              ...state.progress,
              {
                tutorialId,
                completedLessons: [],
                currentLesson: firstLessonId,
                startedAt: Date.now(),
              },
            ],
            currentTutorialId: tutorialId,
            currentLessonId: firstLessonId,
          }));
        } else {
          set({
            currentTutorialId: tutorialId,
            currentLessonId: existing.currentLesson,
          });
        }
      },

      // Set current lesson
      setCurrentLesson: (tutorialId, lessonId) => {
        set((state) => ({
          currentTutorialId: tutorialId,
          currentLessonId: lessonId,
          progress: state.progress.map((p) =>
            p.tutorialId === tutorialId
              ? { ...p, currentLesson: lessonId }
              : p
          ),
        }));
      },

      // Complete a lesson
      completeLesson: (tutorialId, lessonId) => {
        set((state) => ({
          progress: state.progress.map((p) => {
            if (p.tutorialId === tutorialId) {
              const alreadyCompleted = p.completedLessons.includes(lessonId);
              return {
                ...p,
                completedLessons: alreadyCompleted
                  ? p.completedLessons
                  : [...p.completedLessons, lessonId],
              };
            }
            return p;
          }),
        }));
      },

      // Complete entire tutorial
      completeTutorial: (tutorialId) => {
        set((state) => ({
          progress: state.progress.map((p) =>
            p.tutorialId === tutorialId
              ? { ...p, completedAt: Date.now() }
              : p
          ),
        }));
      },

      // Reset tutorial progress
      resetTutorialProgress: (tutorialId) => {
        set((state) => ({
          progress: state.progress.filter((p) => p.tutorialId !== tutorialId),
          currentTutorialId:
            state.currentTutorialId === tutorialId
              ? null
              : state.currentTutorialId,
          currentLessonId:
            state.currentTutorialId === tutorialId
              ? null
              : state.currentLessonId,
        }));
      },

      // Code management
      setTutorialCode: (code) => set({ tutorialCode: code }),

      // Test management
      setTestResults: (results) => set({ testResults: results }),
      setIsRunningTests: (running) => set({ isRunningTests: running }),
      clearTestResults: () => set({ testResults: [] }),

      // Queries
      getTutorialProgress: (tutorialId) => {
        return get().progress.find((p) => p.tutorialId === tutorialId);
      },

      isLessonCompleted: (tutorialId, lessonId) => {
        const progress = get().progress.find((p) => p.tutorialId === tutorialId);
        return progress?.completedLessons.includes(lessonId) ?? false;
      },

      isTutorialCompleted: (tutorialId) => {
        const progress = get().progress.find((p) => p.tutorialId === tutorialId);
        return progress?.completedAt !== undefined;
      },

      getCompletedLessonsCount: (tutorialId) => {
        const progress = get().progress.find((p) => p.tutorialId === tutorialId);
        return progress?.completedLessons.length ?? 0;
      },
    }),
    {
      name: 'zk-playground-tutorials',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        currentTutorialId: state.currentTutorialId,
        currentLessonId: state.currentLessonId,
      }),
    }
  )
);

export default useTutorialStore;
