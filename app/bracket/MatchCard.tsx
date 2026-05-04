import { useState } from "react";
import type { Match, MatchSlot } from "./types";

export type SwapTarget = {
  matchIndex: number;
  slotIndex: 0 | 1;
};

type Props = {
  match: Match;
  totalRounds: number;
  onPickWinner: (
    round: number,
    matchIndex: number,
    slotIndex: 0 | 1,
  ) => void;
  onSwap: (from: SwapTarget, to: SwapTarget) => void;
};

const DRAG_MIME = "application/x-bracket-slot";

export function MatchCard({ match, totalRounds, onPickWinner, onSwap }: Props) {
  const [hoverSlot, setHoverSlot] = useState<0 | 1 | null>(null);

  const isFinal = match.round === totalRounds - 1;
  const isSemi = match.round === totalRounds - 2;
  const roundLabel = isFinal
    ? "결승"
    : isSemi
      ? "준결승"
      : `${match.round + 1}R`;

  return (
    <div className="w-56 rounded-md border border-gray-700 bg-gray-900/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-800 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500">
        <span>{roundLabel}</span>
        <span>경기 {match.matchIndex + 1}</span>
      </div>
      {[0, 1].map((slotIdx) => {
        const idx = slotIdx as 0 | 1;
        const slot = match.slots[idx];
        const isWinner = match.winnerIndex === idx;
        const isLoser =
          match.winnerIndex !== null && match.winnerIndex !== idx;
        return (
          <SlotRow
            key={idx}
            slot={slot}
            slotIndex={idx}
            match={match}
            isWinner={isWinner}
            isLoser={isLoser}
            isDropHover={hoverSlot === idx}
            onPick={() => onPickWinner(match.round, match.matchIndex, idx)}
            onDragHover={(active) => setHoverSlot(active ? idx : null)}
            onSwap={onSwap}
          />
        );
      })}
    </div>
  );
}

type SlotRowProps = {
  slot: MatchSlot;
  slotIndex: 0 | 1;
  match: Match;
  isWinner: boolean;
  isLoser: boolean;
  isDropHover: boolean;
  onPick: () => void;
  onDragHover: (active: boolean) => void;
  onSwap: (from: SwapTarget, to: SwapTarget) => void;
};

type DragPayload = {
  matchIndex: number;
  slotIndex: 0 | 1;
};

function SlotRow({
  slot,
  slotIndex,
  match,
  isWinner,
  isLoser,
  isDropHover,
  onPick,
  onDragHover,
  onSwap,
}: SlotRowProps) {
  const isRound0 = match.round === 0;
  const draggable = isRound0 && !!slot;

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return;
    const payload: DragPayload = {
      matchIndex: match.matchIndex,
      slotIndex,
    };
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isRound0) return;
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragHover(true);
  };

  const handleDragLeave = () => {
    onDragHover(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isRound0) return;
    e.preventDefault();
    onDragHover(false);
    const raw = e.dataTransfer.getData(DRAG_MIME);
    if (!raw) return;
    let payload: DragPayload;
    try {
      payload = JSON.parse(raw) as DragPayload;
    } catch {
      return;
    }
    onSwap(
      { matchIndex: payload.matchIndex, slotIndex: payload.slotIndex },
      { matchIndex: match.matchIndex, slotIndex },
    );
  };

  const base =
    "flex items-center justify-between gap-2 px-3 py-2 text-sm select-none";
  const stateClass = isWinner
    ? "bg-emerald-500/15 text-emerald-200 font-semibold"
    : isLoser
      ? "text-gray-500 line-through"
      : "text-gray-200 hover:bg-gray-800/70";
  const dropClass = isDropHover
    ? "ring-2 ring-inset ring-amber-400 bg-amber-400/10"
    : "";
  const cursorClass = slot
    ? draggable
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-pointer"
    : "cursor-default";

  return (
    <div
      className={`${base} ${stateClass} ${dropClass} ${cursorClass} ${
        slotIndex === 0 ? "border-b border-gray-800" : ""
      }`}
      onClick={() => slot && onPick()}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="truncate">
        {slot ? slot.name : <span className="text-gray-600">— BYE —</span>}
      </span>
      {isWinner && (
        <span className="shrink-0 text-[10px] uppercase tracking-wider text-emerald-300">
          승
        </span>
      )}
    </div>
  );
}
