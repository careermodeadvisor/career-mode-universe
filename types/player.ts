export type Player = {
  playerId: string;
  name: string;
  longName: string;
  team: string;
  nationality: string;
  position: string;
  age: number;
  rating: number;
  potential: number;
};

export type EvaluatedPlayer = Player & {
  growth: number;
  result: string;
  reasons: string[];
};