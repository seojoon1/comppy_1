import { useState } from "react";
import { MatchCard } from "./MatchCard";
import { Sidebar } from "./Sidebar";
import { ResultsModal } from "./ResultsModal";
import type { Bracket } from "./types";
import {
  buildBracket,
  buildResultsText,
  clearWinners,
  createParticipants,
  renameParticipant,
  setWinner,
} from "./utils";

export function BracketView() {
  const [pendingCount, setPendingCount] = useState(8);
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const handleGenerate = () => {
    const n = Math.max(2, Math.min(128, pendingCount || 0));
    setPendingCount(n);
    setBracket(buildBracket(createParticipants(n)));
  };

  const handleReset = () => {
    if (!bracket) return;
    setBracket(clearWinners(bracket));
  };

  const handleRename = (id: string, name: string) => {
    if (!bracket) return;
    setBracket(renameParticipant(bracket, id, name));
  };

  const handlePickWinner = (
    round: number,
    matchIndex: number,
    slotIndex: 0 | 1,
  ) => {
    if (!bracket) return;
    setBracket(setWinner(bracket, round, matchIndex, slotIndex));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-gray-100">
      <Sidebar
        bracket={bracket}
        pendingCount={pendingCount}
        onPendingCountChange={setPendingCount}
        onGenerate={handleGenerate}
        onReset={handleReset}
        onRenameParticipant={handleRename}
        onShowResults={() => setResultsOpen(true)}
      />
      <main className="flex-1 overflow-auto p-8">
        {bracket && bracket.rounds.length > 0 ? (
          <BracketCanvas
            bracket={bracket}
            onPickWinner={handlePickWinner}
          />
        ) : (
          <EmptyState />
        )}
      </main>
      {resultsOpen && bracket && (
        <ResultsModal
          text={buildResultsText(bracket)}
          onClose={() => setResultsOpen(false)}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/40 px-12 py-16">
        <div className="text-2xl font-semibold text-gray-300">
          브라킷이 없습니다
        </div>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          좌측 사이드바에서 총 인원수를 입력하고
          <br />
          <span className="text-emerald-400">브라킷 생성</span> 버튼을
          눌러주세요.
        </p>
      </div>
    </div>
  );
}

type CanvasProps = {
  bracket: Bracket;
  onPickWinner: (
    round: number,
    matchIndex: number,
    slotIndex: 0 | 1,
  ) => void;
};

function BracketCanvas({ bracket, onPickWinner }: CanvasProps) {
  const totalRounds = bracket.rounds.length;
  const firstRoundCount = bracket.rounds[0].length;
  // Each match needs ~88px of vertical space minimum; the column height is
  // shared across rounds so flex's justify-around does the alignment work.
  const minHeight = Math.max(firstRoundCount * 96, 480);

  return (
    <div
      className="flex items-stretch gap-12"
      style={{ minHeight: `${minHeight}px` }}
    >
      {bracket.rounds.map((round, rIdx) => (
        <div
          key={rIdx}
          className="flex flex-col justify-around gap-3"
        >
          {round.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              totalRounds={totalRounds}
              onPickWinner={onPickWinner}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
