export type CareerTier = "High Tier" | "Mid Tier" | "Low Tier";

export type CareerIdea = {
  id: string;
  clubName: string;
  nation: string;
  league: string;
  category: CareerTier;
  difficulty: string;
};

export type TierChallenges = Record<CareerTier, string[]>;