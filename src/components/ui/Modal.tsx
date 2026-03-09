import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className="
          relative 
          bg-[#16213e] 
          border border-[#0f3460] 
          rounded-2xl 
          p-6 
          max-w-md 
          w-full 
          shadow-2xl 
          animate-in 
          fade-in 
          zoom-in-95 
          duration-200
        "
      >
        {title && (
          <h2 className="text-xl font-bold text-[#eaeaea] mb-4 text-center">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
