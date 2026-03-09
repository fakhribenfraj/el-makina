"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePeerStore } from '@/stores/usePeerStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function JoinRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomCode, setRoomCode] = useState(searchParams.get('code') || '');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  
  const { joinRoom, connectionStatus, error: storeError } = usePeerStore();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setRoomCode(code);
    }
  }, [searchParams]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      router.push(`/lobby/${roomCode}`);
    }
  }, [connectionStatus, roomCode, router]);

  const handleJoin = async () => {
    if (!roomCode.trim() || !playerName.trim()) return;
    
    setIsJoining(true);
    setError('');
    
    try {
      await joinRoom(roomCode.toUpperCase().trim(), playerName.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-[#eaeaea] mb-8">
        Join Game
      </h1>
      
      <div className="w-full max-w-sm space-y-4">
        <Input
          label="Room Code"
          placeholder="Enter 4-digit code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={4}
        />
        
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
        />
        
        <Button
          className="w-full"
          onClick={handleJoin}
          disabled={!roomCode.trim() || !playerName.trim() || isJoining}
        >
          {isJoining ? 'Joining...' : 'Join Game'}
        </Button>
        
        {(error || storeError) && (
          <p className="text-red-500 text-sm">
            {error || storeError}
          </p>
        )}
        
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push('/')}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

export default function JoinRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <p className="text-[#a0a0a0]">Loading...</p>
      </div>
    }>
      <JoinRoomForm />
    </Suspense>
  );
}
