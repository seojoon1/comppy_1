export type Participant = {
  id: string;
  name: string;
};

export type MatchSlot = Participant | null;

export type Match = {
  id: string;
  round: number;
  matchIndex: number;
  slots: [MatchSlot, MatchSlot];
  winnerIndex: 0 | 1 | null;
};

export type Bracket = {
  rounds: Match[][];
  participants: Participant[];
};
