// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-2xl text-center space-y-8">
        {/* Headline */}
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          DressMe <span className="text-primary">AI</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground">
          Discover outfits curated just for <strong>you</strong>. Our AI-powered
          recommender adapts to your <strong>style preferences</strong>,{" "}
          <strong>gender</strong>, and <strong>skin tone</strong> — helping you
          find clothes that truly fit your identity.
        </p>

        {/* Call-to-actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile">
            <Button variant="outline" size="lg" className="px-8">
              👤 Manage Profile
            </Button>
          </Link>
        </div>

        {/* Extra tagline */}
        <p className="text-sm text-muted-foreground">
          Start exploring and let <strong>DressMe AI</strong>
          personalize your fashion journey.
        </p>
      </div>
    </main>
  );
}
