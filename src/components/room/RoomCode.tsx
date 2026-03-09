import React from 'react';

interface RoomCodeDisplayProps {
  code: string;
}

export function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-[#a0a0a0] mb-2">Room Code</p>
      <div className="flex gap-2">
        {code.split('').map((char, index) => (
          <div
            key={index}
            className="w-12 h-16 bg-[#16213e] border-2 border-[#e94560] rounded-lg flex items-center justify-center"
          >
            <span className="text-2xl font-bold text-[#eaeaea]">{char}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#a0a0a0] mt-2">
        Share this code with players
      </p>
    </div>
  );
}
