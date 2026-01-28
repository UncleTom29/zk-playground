import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileCode,
  Zap,
  Shield,
  Upload,
  BookOpen,
  LayoutGrid,
  Share2,
  ArrowRight,
  Github,
  Terminal,
} from "lucide-react";

const features = [
  {
    icon: FileCode,
    title: "Monaco Editor",
    description: "VS Code-powered editor with Noir syntax highlighting, auto-completion, and error markers.",
  },
  {
    icon: Zap,
    title: "In-Browser Compilation",
    description: "Compile Noir circuits directly in your browser using WebAssembly. No installation required.",
  },
  {
    icon: Shield,
    title: "Proof Generation",
    description: "Generate Zero-Knowledge proofs using Barretenberg. Verify locally or on-chain.",
  },
  {
    icon: Upload,
    title: "One-Click Deploy",
    description: "Deploy your verifier to Solana devnet or mainnet with a single click using Sunspot.",
  },
  {
    icon: BookOpen,
    title: "Interactive Tutorials",
    description: "Learn ZK proofs step-by-step with guided lessons and hands-on challenges.",
  },
  {
    icon: Share2,
    title: "Share & Collaborate",
    description: "Share your circuits via IPFS. Browse community circuits in the gallery.",
  },
];

const templates = [
  { name: "Hello World", difficulty: "beginner", description: "Simple square proof" },
  { name: "Hash Preimage", difficulty: "beginner", description: "Prove knowledge of a hash preimage" },
  { name: "Merkle Proof", difficulty: "intermediate", description: "Prove membership in a Merkle tree" },
  { name: "ECDSA Signature", difficulty: "advanced", description: "Verify ECDSA signatures" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                ZK
              </div>
              <span className="text-xl font-bold">ZK-Playground</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/learn">
                <Button variant="ghost">Learn</Button>
              </Link>
              <Link href="/templates">
                <Button variant="ghost">Templates</Button>
              </Link>
              <Link href="/gallery">
                <Button variant="ghost">Gallery</Button>
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5" />
                </Button>
              </a>
              <Link href="/playground">
                <Button>
                  <Terminal className="mr-2 h-4 w-4" />
                  Open Playground
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          Browser-based ZK Circuit IDE
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Write, Prove, Deploy
          <br />
          <span className="text-primary">Zero-Knowledge Circuits</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          An interactive browser-based environment for learning and testing Zero-Knowledge
          circuits with Noir. One-click deployment to Solana devnet and mainnet.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/playground">
            <Button size="lg" className="gap-2">
              Start Coding
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/learn">
            <Button size="lg" variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Learn ZK Proofs
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to build ZK applications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Templates Section */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Circuit Templates</h2>
            <p className="text-muted-foreground">
              Start quickly with pre-built circuit templates
            </p>
          </div>
          <Link href="/templates">
            <Button variant="outline" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              View All Templates
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <Card key={template.name} className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge
                    variant={
                      template.difficulty === "beginner"
                        ? "default"
                        : template.difficulty === "intermediate"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center border-t">
        <h2 className="text-3xl font-bold mb-4">Ready to build your first ZK proof?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          No installation required. Start coding in your browser right now.
        </p>
        <Link href="/playground">
          <Button size="lg" className="gap-2">
            Open Playground
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                ZK
              </div>
              <span className="font-semibold">ZK-Playground</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://noir-lang.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Noir Docs
              </a>
              <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Solana
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
