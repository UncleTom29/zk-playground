'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Lightbulb,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useTutorialStore } from '@/stores/tutorialStore';
import { getTutorialById, getNextLesson, getPreviousLesson } from '@/lib/tutorials/tutorialData';
import { runTests, checkSolutionSimilarity } from '@/lib/tutorials/testRunner';
import type { Tutorial, Lesson } from '@/types';

// Dynamically import Monaco editor
const NoirEditor = dynamic(() => import('@/components/editor/NoirEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading editor...</span>
      </div>
    </div>
  ),
});

interface TutorialPlayerProps {
  tutorialId: string;
  lessonId?: string;
}

export default function TutorialPlayer({ tutorialId, lessonId }: TutorialPlayerProps) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [code, setCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  const {
    startTutorial,
    setCurrentLesson,
    completeLesson,
    isLessonCompleted,
    testResults,
    setTestResults,
    isRunningTests,
    setIsRunningTests,
    clearTestResults,
    getTutorialProgress,
  } = useTutorialStore();

  // Load tutorial and lesson
  useEffect(() => {
    const loadedTutorial = getTutorialById(tutorialId);
    if (loadedTutorial) {
      setTutorial(loadedTutorial);

      // Determine which lesson to show
      const progress = getTutorialProgress(tutorialId);
      const targetLessonId = lessonId || progress?.currentLesson || loadedTutorial.lessons[0]?.id;

      const loadedLesson = loadedTutorial.lessons.find((l) => l.id === targetLessonId);
      if (loadedLesson) {
        setLesson(loadedLesson);
        setCode(loadedLesson.starterCode);
        startTutorial(tutorialId, loadedTutorial.lessons[0].id);
        setCurrentLesson(tutorialId, targetLessonId);
      }
    }
  }, [tutorialId, lessonId, getTutorialProgress, startTutorial, setCurrentLesson]);

  // Reset state when lesson changes
  useEffect(() => {
    if (lesson) {
      setCode(lesson.starterCode);
      setShowHints(false);
      setCurrentHint(0);
      setShowSolution(false);
      clearTestResults();
    }
  }, [lesson?.id, clearTestResults]);

  const handlePreviousLesson = useCallback(() => {
    if (!tutorial || !lesson) return;

    const prevLesson = getPreviousLesson(tutorialId, lesson.id);
    if (prevLesson) {
      setLesson(prevLesson);
      setCurrentLesson(tutorialId, prevLesson.id);
    }
  }, [tutorial, lesson, tutorialId, setCurrentLesson]);

  const handleNextLesson = useCallback(() => {
    if (!tutorial || !lesson) return;

    const nextLesson = getNextLesson(tutorialId, lesson.id);
    if (nextLesson) {
      setLesson(nextLesson);
      setCurrentLesson(tutorialId, nextLesson.id);
    }
  }, [tutorial, lesson, tutorialId, setCurrentLesson]);

  const handleRunTests = useCallback(async () => {
    if (!lesson?.challenge) return;

    setIsRunningTests(true);
    clearTestResults();
    setTestProgress(0);

    try {
      const result = await runTests({
        code,
        challenge: lesson.challenge,
        onProgress: (current, total) => {
          setTestProgress((current / total) * 100);
        },
      });

      setTestResults(result.results);

      // Auto-complete lesson if all tests pass
      if (result.passed) {
        completeLesson(tutorialId, lesson.id);
      }
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsRunningTests(false);
    }
  }, [
    code,
    lesson,
    tutorialId,
    setIsRunningTests,
    clearTestResults,
    setTestResults,
    completeLesson,
  ]);

  const handleShowSolution = useCallback(() => {
    if (lesson) {
      setShowSolution(true);
      const { feedback } = checkSolutionSimilarity(code, lesson.solution);
      console.log(feedback);
    }
  }, [code, lesson]);

  const handleResetCode = useCallback(() => {
    if (lesson) {
      setCode(lesson.starterCode);
      setShowSolution(false);
      clearTestResults();
    }
  }, [lesson, clearTestResults]);

  const handleCopySolution = useCallback(() => {
    if (lesson) {
      setCode(lesson.solution);
      setShowSolution(false);
    }
  }, [lesson]);

  if (!tutorial || !lesson) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Tutorial not found</p>
        </div>
      </div>
    );
  }

  const lessonIndex = tutorial.lessons.findIndex((l) => l.id === lesson.id);
  const totalLessons = tutorial.lessons.length;
  const progress = ((lessonIndex + 1) / totalLessons) * 100;
  const isCompleted = isLessonCompleted(tutorialId, lesson.id);
  const hasPrevious = lessonIndex > 0;
  const hasNext = lessonIndex < totalLessons - 1;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tutorial.difficulty}</Badge>
            <h1 className="text-lg font-semibold">{tutorial.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Lesson {lessonIndex + 1} of {totalLessons}
          </span>
          <Progress value={progress} className="flex-1 h-2" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Lesson content (left) */}
        <div className="w-1/2 border-r">
          <ScrollArea className="h-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{lesson.title}</h2>

              {/* Markdown content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.content}
                </ReactMarkdown>
              </div>

              {/* Challenge section */}
              {lesson.challenge && (
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Challenge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {lesson.challenge.description}
                    </p>

                    {/* Requirements */}
                    <div className="space-y-2 mb-4">
                      <span className="text-sm font-medium">Requirements:</span>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {lesson.challenge.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Test cases */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Test Cases:</span>
                      <div className="space-y-1">
                        {lesson.challenge.testCases.map((tc, i) => {
                          const result = testResults[i];
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded text-sm ${
                                result
                                  ? result.passed
                                    ? 'bg-green-500/10'
                                    : 'bg-red-500/10'
                                  : 'bg-muted'
                              }`}
                            >
                              {result ? (
                                result.passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )
                              ) : (
                                <div className="h-4 w-4 rounded-full border" />
                              )}
                              <span>{tc.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hints section */}
              {lesson.hints.length > 0 && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Hints
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHints(!showHints)}
                      >
                        {showHints ? 'Hide' : 'Show'} Hints
                      </Button>
                    </div>
                  </CardHeader>
                  {showHints && (
                    <CardContent>
                      <div className="space-y-2">
                        {lesson.hints.slice(0, currentHint + 1).map((hint, i) => (
                          <Alert key={i}>
                            <AlertDescription>
                              <strong>Hint {i + 1}:</strong> {hint}
                            </AlertDescription>
                          </Alert>
                        ))}
                        {currentHint < lesson.hints.length - 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentHint(currentHint + 1)}
                          >
                            Show next hint
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Editor (right) */}
        <div className="w-1/2 flex flex-col">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between border-b p-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRunTests}
                    disabled={isRunningTests || !lesson.challenge}
                  >
                    {isRunningTests ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Tests
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run test cases</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleResetCode}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to starter code</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowSolution}
                    disabled={showSolution}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Solution
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View solution</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Running tests progress */}
          {isRunningTests && (
            <div className="p-2 border-b">
              <Progress value={testProgress} className="h-1" />
            </div>
          )}

          {/* Editor */}
          <div className="flex-1">
            <NoirEditor
              code={code}
              onChange={setCode}
              theme="dark"
              errors={[]}
            />
          </div>

          {/* Solution panel */}
          {showSolution && (
            <div className="border-t p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Solution:</span>
                <Button variant="outline" size="sm" onClick={handleCopySolution}>
                  Copy to Editor
                </Button>
              </div>
              <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-40">
                <code>{lesson.solution}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t p-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousLesson}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Lesson
        </Button>

        <div className="flex items-center gap-2">
          {tutorial.lessons.map((l, i) => (
            <button
              key={l.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                l.id === lesson.id
                  ? 'bg-primary'
                  : isLessonCompleted(tutorialId, l.id)
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/30'
              }`}
              onClick={() => {
                setLesson(l);
                setCurrentLesson(tutorialId, l.id);
              }}
              title={`Lesson ${i + 1}: ${l.title}`}
            />
          ))}
        </div>

        <Button onClick={handleNextLesson} disabled={!hasNext}>
          Next Lesson
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
