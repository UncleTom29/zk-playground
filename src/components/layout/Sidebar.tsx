'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileCode,
  LayoutGrid,
  Settings,
  ChevronRight,
  File,
  Folder,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onSelectTemplate?: (template: { name: string; code: string }) => void;
}

// Basic templates for the sidebar
const QUICK_TEMPLATES = [
  {
    name: 'Hello World',
    description: 'Simple square proof',
    code: `fn main(x: pub Field, y: Field) {
    assert(x == y * y);
}`,
  },
  {
    name: 'Hash Preimage',
    description: 'Prove knowledge of preimage',
    code: `use std::hash::poseidon;

fn main(hash: pub Field, preimage: Field) {
    let computed_hash = poseidon::bn254::hash_1([preimage]);
    assert(hash == computed_hash);
}`,
  },
  {
    name: 'Range Proof',
    description: 'Prove value in range',
    code: `fn main(value: Field, min: pub Field, max: pub Field) {
    // Assert value is within range [min, max]
    assert(value as u64 >= min as u64);
    assert(value as u64 <= max as u64);
}`,
  },
  {
    name: 'Age Verification',
    description: 'Prove age > 18',
    code: `fn main(age: Field, min_age: pub Field) {
    assert(age as u32 >= min_age as u32);
}`,
  },
];

export default function Sidebar({ onSelectTemplate }: SidebarProps) {
  const { activePanel, setActivePanel, fontSize, setFontSize, minimap, setMinimap, wordWrap, setWordWrap } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = QUICK_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFilesPanel = () => (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Files
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 rounded px-2 py-1 bg-accent">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">main.nr</span>
        </div>
        <div className="flex items-center gap-2 rounded px-2 py-1 hover:bg-accent cursor-pointer">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Nargo.toml</span>
        </div>
      </div>
    </div>
  );

  const renderTemplatesPanel = () => (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-7 text-sm"
        />
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="flex flex-col gap-1">
          {filteredTemplates.map((template) => (
            <button
              key={template.name}
              onClick={() => onSelectTemplate?.(template)}
              className="flex flex-col items-start gap-1 rounded px-2 py-2 text-left hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{template.name}</span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderSettingsPanel = () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="fontSize" className="text-sm">
          Font Size
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="fontSize"
            type="number"
            min={10}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
            className="h-8 w-20"
          />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="minimap" className="text-sm">
          Show Minimap
        </Label>
        <Button
          id="minimap"
          variant={minimap ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMinimap(!minimap)}
        >
          {minimap ? 'On' : 'Off'}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="wordWrap" className="text-sm">
          Word Wrap
        </Label>
        <Button
          id="wordWrap"
          variant={wordWrap ? 'default' : 'outline'}
          size="sm"
          onClick={() => setWordWrap(!wordWrap)}
        >
          {wordWrap ? 'On' : 'Off'}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Keyboard Shortcuts
        </span>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Compile</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5">Ctrl+B</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Generate Proof</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5">Ctrl+P</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Save</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5">Ctrl+S</kbd>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Icon bar */}
        <div className="flex w-12 flex-col items-center gap-2 border-r bg-muted/30 py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activePanel === 'files' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setActivePanel('files')}
              >
                <Folder className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Files</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activePanel === 'templates' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setActivePanel('templates')}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Templates</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activePanel === 'settings' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setActivePanel('settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Panel content */}
        <div className="w-56 border-r bg-background">
          {activePanel === 'files' && renderFilesPanel()}
          {activePanel === 'templates' && renderTemplatesPanel()}
          {activePanel === 'settings' && renderSettingsPanel()}
        </div>
      </div>
    </TooltipProvider>
  );
}
