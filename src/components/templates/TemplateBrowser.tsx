'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Grid,
  List,
  Play,
  Copy,
  Eye,
  FileCode,
  Shield,
  Lock,
  Gamepad2,
  Coins,
} from 'lucide-react';
import {
  templates,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplates,
} from '@/lib/templates/templateData';
import { useEditorStore } from '@/stores/editorStore';
import type { Template, TemplateCategory, Difficulty } from '@/types';

interface TemplateBrowserProps {
  onSelectTemplate?: (template: Template) => void;
}

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  basic: <FileCode className="h-4 w-4" />,
  cryptography: <Shield className="h-4 w-4" />,
  privacy: <Lock className="h-4 w-4" />,
  games: <Gamepad2 className="h-4 w-4" />,
  defi: <Coins className="h-4 w-4" />,
};

const categoryLabels: Record<TemplateCategory, string> = {
  basic: 'Basic',
  cryptography: 'Cryptography',
  privacy: 'Privacy',
  games: 'Games',
  defi: 'DeFi',
};

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'bg-green-500/10 text-green-500',
  intermediate: 'bg-yellow-500/10 text-yellow-500',
  advanced: 'bg-red-500/10 text-red-500',
};

export default function TemplateBrowser({ onSelectTemplate }: TemplateBrowserProps) {
  const router = useRouter();
  const { setCode, setCurrentFileName } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = getTemplatesByCategory(categoryFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter((t) => t.difficulty === difficultyFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searched = searchTemplates(searchQuery);
      result = result.filter((t) => searched.includes(t));
    }

    return result;
  }, [searchQuery, categoryFilter, difficultyFilter]);

  const handleUseTemplate = useCallback(
    (template: Template) => {
      if (onSelectTemplate) {
        onSelectTemplate(template);
      } else {
        // Set code in editor store
        setCode(template.code);
        setCurrentFileName(`${template.id}.nr`);
        // Navigate to playground
        router.push('/playground');
      }
    },
    [onSelectTemplate, setCode, setCurrentFileName, router]
  );

  const handlePreview = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  }, []);

  const handleCopyCode = useCallback((template: Template) => {
    navigator.clipboard.writeText(template.code);
  }, []);

  const renderTemplateCard = (template: Template) => (
    <Card
      key={template.id}
      className="hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => handlePreview(template)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {categoryIcons[template.category]}
            <CardTitle className="text-base">{template.name}</CardTitle>
          </div>
          <Badge className={difficultyColors[template.difficulty]}>
            {template.difficulty}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCode(template);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleUseTemplate(template);
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateList = (template: Template) => (
    <div
      key={template.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => handlePreview(template)}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded bg-muted">
          {categoryIcons[template.category]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{template.name}</span>
            <Badge className={difficultyColors[template.difficulty]}>
              {template.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {template.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handlePreview(template);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleUseTemplate(template);
          }}
        >
          <Play className="h-4 w-4 mr-2" />
          Use
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-4">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as TemplateCategory | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="cryptography">Cryptography</SelectItem>
              <SelectItem value="privacy">Privacy</SelectItem>
              <SelectItem value="games">Games</SelectItem>
              <SelectItem value="defi">DeFi</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter}
            onValueChange={(value) => setDifficultyFilter(value as Difficulty | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Template count */}
      <div className="px-4 py-2 border-b bg-muted/50">
        <span className="text-sm text-muted-foreground">
          {filteredTemplates.length} templates found
        </span>
      </div>

      {/* Templates */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map(renderTemplateList)}
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileCode className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No templates found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {categoryIcons[selectedTemplate.category]}
                  <DialogTitle>{selectedTemplate.name}</DialogTitle>
                </div>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2 my-2">
                <Badge className={difficultyColors[selectedTemplate.difficulty]}>
                  {selectedTemplate.difficulty}
                </Badge>
                <Badge variant="outline">
                  {categoryLabels[selectedTemplate.category]}
                </Badge>
                {selectedTemplate.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Tabs defaultValue="code" className="flex-1 overflow-hidden flex flex-col">
                <TabsList>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="inputs">Sample Inputs</TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full max-h-[400px]">
                    <pre className="p-4 bg-muted rounded text-sm">
                      <code>{selectedTemplate.code}</code>
                    </pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="inputs" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full max-h-[400px]">
                    <pre className="p-4 bg-muted rounded text-sm">
                      <code>
                        {JSON.stringify(selectedTemplate.sampleInputs, null, 2)}
                      </code>
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => handleCopyCode(selectedTemplate)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setPreviewOpen(false);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
