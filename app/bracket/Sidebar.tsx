import { useState } from "react";
import type { Bracket } from "./types";
import { getChampion } from "./utils";

type Props = {
  bracket: Bracket | null;
  pendingCount: number;
  onPendingCountChange: (n: number) => void;
  onGenerate: () => void;
  onReset: () => void;
  onRenameParticipant: (id: string, name: string) => void;
  onShowResults: () => void;
};

export function Sidebar({
  bracket,
  pendingCount,
  onPendingCountChange,
  onGenerate,
  onReset,
  onRenameParticipant,
  onShowResults,
}: Props) {
  const [namesOpen, setNamesOpen] = useState(false);

  const champion = bracket ? getChampion(bracket) : null;
  const hasBracket = !!bracket && bracket.rounds.length > 0;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-gray-800 bg-gray-950">
      <div className="border-b border-gray-800 px-5 py-4">
        <h1 className="text-lg font-semibold text-gray-100">
          토너먼트 브라킷
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          싱글 엘리미네이션 방식의 토너먼트 브라킷 생성기입니다.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="참가자 설정">
          <label className="block text-xs text-gray-400">총 인원수</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              min={2}
              max={128}
              value={pendingCount}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                onPendingCountChange(Number.isFinite(v) ? v : 0);
              }}
              className="w-20 rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-gray-100 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={onGenerate}
              className="flex-1 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 active:bg-emerald-700"
            >
              브라킷 생성
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            2의 거듭제곱이 아니면 부전승으로 자동 채워집니다.
          </p>
        </Section>

        <Section title="유틸리티">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={!hasBracket}
              className="rounded border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={onShowResults}
              disabled={!hasBracket}
              className="rounded border border-amber-700/50 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              결과 추출
            </button>
          </div>
        </Section>

        {hasBracket && bracket && (
          <Section title="참가자 명단">
            <button
              type="button"
              onClick={() => setNamesOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800/60"
            >
              <span>{namesOpen ? "접기" : "펼치기"}</span>
              <span>{bracket.participants.length}명</span>
            </button>
            {namesOpen && (
              <div className="mt-2 space-y-1.5">
                {bracket.participants.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-right text-[11px] text-gray-500">
                      {i + 1}
                    </span>
                    <input
                      value={p.name}
                      onChange={(e) =>
                        onRenameParticipant(p.id, e.target.value)
                      }
                      className="flex-1 rounded border border-gray-800 bg-gray-900 px-2 py-1 text-xs text-gray-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {champion && (
          <Section title="우승자">
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-amber-300">
                Champion
              </div>
              <div className="mt-1 text-base font-semibold text-amber-100">
                {champion.name}
              </div>
            </div>
          </Section>
        )}
      </div>

      <div className="border-t border-gray-800 px-5 py-3 text-[11px] text-gray-600">
        Made by seojoon1
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-800 px-5 py-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h2>
      {children}
    </div>
  );
}
