"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#eaeaea] mb-4">
          El Cartel
        </h1>
        <p className="text-xl text-[#a0a0a0]">
          A multiplayer card game
        </p>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push('/create')}
        >
          Create Game Room
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => router.push('/join')}
        >
          Join Game Room
        </Button>
      </div>

      <div className="mt-12 text-center text-sm text-[#6a6a8a]">
        <p>2-8 players</p>
        <p>Real-time P2P gameplay</p>
      </div>
    </div>
  );
}
