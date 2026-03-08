"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

interface QRGeneratorProps {
  peerId: string;
}

export default function QRGenerator({ peerId }: QRGeneratorProps) {
  const [qrValue, setQrValue] = useState(peerId);

  useEffect(() => {
    setQrValue(`${window.location.origin}/?room=${peerId}`);
  }, [peerId]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative p-4 bg-white rounded-2xl shadow-xl">
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-cyan-500/20 to-purple-500/20 blur-xl" />
        <div className="relative bg-white rounded-xl p-3">
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="H"
            bgColor="#ffffff"
            fgColor="#0f172a"
            imageSettings={{
              src: "",
              height: 0,
              width: 0,
              excavate: false,
            }}
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-400 mb-1">Your Room ID</p>
        <code className="text-xs bg-slate-800/50 px-3 py-1.5 rounded-lg text-cyan-400 font-mono border border-slate-700/50">
          {peerId}
        </code>
      </div>
    </div>
  );
}
