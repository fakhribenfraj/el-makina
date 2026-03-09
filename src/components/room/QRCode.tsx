import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  roomCode: string;
}

export function QRCodeDisplay({ roomCode }: QRCodeDisplayProps) {
  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join?code=${roomCode}`
    : `/join?code=${roomCode}`;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-xl">
        <QRCodeSVG
          value={joinUrl}
          size={180}
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-sm text-[#a0a0a0] mt-3">
        Scan to join
      </p>
    </div>
  );
}
