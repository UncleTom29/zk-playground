'use client';

import { use } from 'react';
import { TutorialPlayer } from '@/components/tutorials';

interface TutorialPageProps {
  params: Promise<{
    tutorialId: string;
  }>;
  searchParams: Promise<{
    lesson?: string;
  }>;
}

export default function TutorialPage({ params, searchParams }: TutorialPageProps) {
  const { tutorialId } = use(params);
  const { lesson } = use(searchParams);

  return (
    <div className="h-screen">
      <TutorialPlayer tutorialId={tutorialId} lessonId={lesson} />
    </div>
  );
}
