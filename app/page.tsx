// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-backgound px-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          👗 DressMe: Personalized Outfit Recommender
        </h1>
        <p className="text-muted-foreground">
          Get outfit recommendations tailored to your <strong>style</strong>,{" "}
          <strong>gender</strong>, and <strong>skin tone</strong> — powered by
          AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/catalog">
            <Button size="lg">🛍️ Browse Catalog</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" size="lg">
              👤 Your Profile
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
