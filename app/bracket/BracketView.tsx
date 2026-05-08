import { useEffect, useState } from "react";
import { MatchCard, type SwapTarget } from "./MatchCard";
import { Sidebar } from "./Sidebar";
import { ResultsModal } from "./ResultsModal";
import type { Bracket } from "./types";
import {
  buildBracket,
  buildResultsText,
  clearWinners,
  createParticipants,
  loadPersistedState,
  renameParticipant,
  savePersistedState,
  setWinner,
  swapRound0Slots,
  reSetBracket,
  shuffleParticipants,
} from "./utils";

export function BracketView() {
  const [pendingCount, setPendingCount] = useState(8);
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadPersistedState();
    if (saved) {
      if (saved.bracket) setBracket(saved.bracket);
      if (typeof saved.pendingCount === "number" && saved.pendingCount > 0) {
        setPendingCount(saved.pendingCount);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePersistedState({ bracket, pendingCount });
  }, [hydrated, bracket, pendingCount]);

  const handleGenerate = () => {
    const n = Math.max(2, Math.min(128, pendingCount || 0));
    setPendingCount(n);
    setBracket(buildBracket(createParticipants(n)));
  };

  const handleReset = () => { //브라켓 초기화 함수 
    // console.log('resetting bracket...');
    reSetBracket(); //로컬 스토리지에서 브라켓 상태 제거
    setBracket(null);
    setPendingCount(8);
  };

  const handleShuffle = () => {
    if (!bracket) return;
    setBracket(shuffleParticipants(bracket));
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

  const handleSwap = (from: SwapTarget, to: SwapTarget) => {
    if (!bracket) return;
    setBracket(swapRound0Slots(bracket, from, to));
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
        onShuffle={handleShuffle}
        onShowResults={() => setResultsOpen(true)}
      />
      <main className="flex-1 overflow-auto p-8">
        {bracket && bracket.rounds.length > 0 ? (
          <BracketCanvas
            bracket={bracket}
            onPickWinner={handlePickWinner}
            onSwap={handleSwap}
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
          대진이 없습니다
        </div>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          좌측 사이드바에서 총 인원수를 입력하고
          <br />
          <span className="text-emerald-400">토너먼트 생성</span> 버튼을
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
  onSwap: (from: SwapTarget, to: SwapTarget) => void;
};

function BracketCanvas({ bracket, onPickWinner, onSwap }: CanvasProps) {
  const totalRounds = bracket.rounds.length;
  const firstRoundCount = bracket.rounds[0].length;
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
              onSwap={onSwap}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
