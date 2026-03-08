"use client";

import { Card, ROLE_EMOJI, ROLE_COLOR, ROLE_DESCRIPTION } from "@/lib/types";

interface HandViewProps {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
}

export default function HandView({
  cards,
  selectedCardId,
  onSelectCard,
}: HandViewProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        No cards in hand
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
        Your Hand
      </h3>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(cards.length, 2)}, 1fr)`,
        }}
      >
        {cards.map((card) => {
          const isSelected = selectedCardId === card.id;
          const color = ROLE_COLOR[card.role];

          return (
            <button
              key={card.id}
              onClick={() => onSelectCard(card.id)}
              className={`
                relative rounded-2xl p-4 transition-all duration-300 text-left
                border-2 overflow-hidden
                ${
                  isSelected
                    ? "scale-[1.03] shadow-xl"
                    : "hover:scale-[1.02] active:scale-[0.98]"
                }
              `}
              style={{
                borderColor: isSelected ? color : color + "40",
                background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                boxShadow: isSelected ? `0 8px 32px ${color}30` : undefined,
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: color }}
              />

              {/* Card content */}
              <div className="relative">
                <span className="text-3xl block mb-2">
                  {ROLE_EMOJI[card.role]}
                </span>
                <h4 className="font-bold text-sm mb-1" style={{ color }}>
                  {card.role}
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                  {ROLE_DESCRIPTION[card.role]}
                </p>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
