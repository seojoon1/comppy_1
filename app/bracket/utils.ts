import type { Bracket, Match, MatchSlot, Participant } from "./types";

const STORAGE_KEY = "bracket-state-v1";

type PersistedState = {
  bracket: Bracket | null;
  pendingCount: number;
};

export function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / serialization errors
  }
}
export function reSetBracket(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore quota / serialization errors  
  }
}

export function createParticipants(count: number): Participant[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `참가자 ${i + 1}`,
  }));
}

export function nextPowerOf2(n: number): number {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function cloneRounds(rounds: Match[][]): Match[][] {
  return rounds.map((r) =>
    r.map((m) => ({ ...m, slots: [...m.slots] as [MatchSlot, MatchSlot] })),
  );
}

export function buildBracket(participants: Participant[]): Bracket {
  if (participants.length < 2) return { rounds: [], participants };

  const size = nextPowerOf2(participants.length);
  const numRounds = Math.log2(size);

  const seeded: MatchSlot[] = Array.from({ length: size }, (_, i) =>
    i < participants.length ? participants[i] : null,
  );

  const rounds: Match[][] = [];

  const round0: Match[] = [];
  for (let i = 0; i < size / 2; i++) {
    const a = seeded[i * 2];
    const b = seeded[i * 2 + 1];
    let winner: 0 | 1 | null = null;
    if (a && !b) winner = 0;
    else if (!a && b) winner = 1;
    round0.push({
      id: `m-0-${i}`,
      round: 0,
      matchIndex: i,
      slots: [a, b],
      winnerIndex: winner,
    });
  }
  rounds.push(round0);

  for (let r = 1; r < numRounds; r++) {
    const matches: Match[] = [];
    const count = rounds[r - 1].length / 2;
    for (let i = 0; i < count; i++) {
      matches.push({
        id: `m-${r}-${i}`,
        round: r,
        matchIndex: i,
        slots: [null, null],
        winnerIndex: null,
      });
    }
    rounds.push(matches);
  }

  return recompute({ rounds, participants });
}

function recompute(b: Bracket): Bracket {
  const rounds = cloneRounds(b.rounds);
  for (let r = 1; r < rounds.length; r++) {
    for (const m of rounds[r]) {
      const f1 = rounds[r - 1][m.matchIndex * 2];
      const f2 = rounds[r - 1][m.matchIndex * 2 + 1];
      const newSlot1 = f1.winnerIndex !== null ? f1.slots[f1.winnerIndex] : null;
      const newSlot2 = f2.winnerIndex !== null ? f2.slots[f2.winnerIndex] : null;
      if (m.winnerIndex !== null) {
        const currentWinner = m.slots[m.winnerIndex];
        const stillSame =
          (m.winnerIndex === 0 && currentWinner?.id === newSlot1?.id) ||
          (m.winnerIndex === 1 && currentWinner?.id === newSlot2?.id);
        if (!stillSame) m.winnerIndex = null;
      }
      m.slots = [newSlot1, newSlot2];
    }
  }
  return { ...b, rounds };
}

export function setWinner(
  b: Bracket,
  round: number,
  matchIndex: number,
  winnerIndex: 0 | 1,
): Bracket {
  const rounds = cloneRounds(b.rounds);
  const match = rounds[round][matchIndex];
  if (!match.slots[winnerIndex]) return b;
  match.winnerIndex = winnerIndex;
  return recompute({ ...b, rounds });
}

export function clearWinners(b: Bracket): Bracket {
  const rounds = cloneRounds(b.rounds);
  for (let r = 0; r < rounds.length; r++) {
    for (const m of rounds[r]) {
      m.winnerIndex = null;
    }
  }
  for (const m of rounds[0]) {
    const [a, bSlot] = m.slots;
    if (a && !bSlot) m.winnerIndex = 0;
    else if (!a && bSlot) m.winnerIndex = 1;
  }
  return recompute({ ...b, rounds });
}

export function renameParticipant(
  b: Bracket,
  participantId: string,
  newName: string,
): Bracket {
  const participants = b.participants.map((p) =>
    p.id === participantId ? { ...p, name: newName } : p,
  );
  const rounds = b.rounds.map((r) =>
    r.map((m) => ({
      ...m,
      slots: m.slots.map((s) =>
        s && s.id === participantId ? { ...s, name: newName } : s,
      ) as [MatchSlot, MatchSlot],
    })),
  );
  return { participants, rounds };
}

export function swapRound0Slots(
  b: Bracket,
  from: { matchIndex: number; slotIndex: 0 | 1 },
  to: { matchIndex: number; slotIndex: 0 | 1 },
): Bracket {
  if (b.rounds.length === 0) return b;
  if (from.matchIndex === to.matchIndex && from.slotIndex === to.slotIndex) {
    return b;
  }
  const rounds = cloneRounds(b.rounds);
  const r0 = rounds[0];
  const tmp = r0[from.matchIndex].slots[from.slotIndex];
  r0[from.matchIndex].slots[from.slotIndex] =
    r0[to.matchIndex].slots[to.slotIndex];
  r0[to.matchIndex].slots[to.slotIndex] = tmp;

  const affected = new Set([from.matchIndex, to.matchIndex]);
  for (const idx of affected) {
    const m = r0[idx];
    const [a, bSlot] = m.slots;
    if (a && !bSlot) m.winnerIndex = 0;
    else if (!a && bSlot) m.winnerIndex = 1;
    else m.winnerIndex = null;
  }
  return recompute({ ...b, rounds });
}

export function getChampion(b: Bracket): Participant | null {
  if (b.rounds.length === 0) return null;
  const finalMatch = b.rounds[b.rounds.length - 1][0];
  if (finalMatch.winnerIndex === null) return null;
  return finalMatch.slots[finalMatch.winnerIndex];
}

export function buildResultsText(b: Bracket): string {
  if (b.rounds.length === 0) return "브라킷이 생성되지 않았습니다.";
  const lines: string[] = [];
  const champion = getChampion(b);
  lines.push(`# 토너먼트 결과`);
  lines.push(`총 참가자: ${b.participants.length}명`);
  lines.push(
    champion ? `우승자: ${champion.name}` : `우승자: (아직 결정되지 않음)`,
  );
  lines.push("");
  b.rounds.forEach((round, idx) => {
    const isFinal = idx === b.rounds.length - 1;
    const isSemi = idx === b.rounds.length - 2;
    const label = isFinal
      ? "결승"
      : isSemi
        ? "준결승"
        : `${idx + 1}라운드`;
    lines.push(`## ${label}`);
    round.forEach((m, mi) => {
      const a = m.slots[0]?.name ?? "(BYE)";
      const bn = m.slots[1]?.name ?? "(BYE)";
      const w =
        m.winnerIndex !== null ? m.slots[m.winnerIndex]?.name : "미정";
      lines.push(`  경기 ${mi + 1}: ${a} vs ${bn}  →  ${w}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}
