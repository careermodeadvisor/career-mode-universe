import Papa from "papaparse";
import type {
  CareerIdea,
  CareerTier,
  TierChallenges,
} from "@/types/careerIdea";

function safe(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeTier(value: string): CareerTier {
  const v = value.toLowerCase();

  if (v.includes("high")) return "High Tier";
  if (v.includes("mid")) return "Mid Tier";

  return "Low Tier";
}

export async function loadCareerIdeas(): Promise<CareerIdea[]> {
  const response = await fetch("/data/career_ideas.csv");

  if (!response.ok) {
    throw new Error("career_ideas.csv not found");
  }

  const csvText = await response.text();

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map((row, index) => ({
      id: String(index),

      clubName: safe(
        row.clubName ||
          row["Club name"] ||
          row.club ||
          row.team
      ),

      nation: safe(
        row.nation ||
          row.Nation
      ),

      league: safe(
        row.league ||
          row.League
      ),

      category: normalizeTier(
        safe(
          row.category ||
            row.Category
        )
      ),

      difficulty: safe(
        row.difficulty ||
          row.Difficulty
      ),
    }))
    .filter((idea) => idea.clubName);
}

export async function loadTierChallenges(): Promise<TierChallenges> {
  const response = await fetch("/data/tier_challenges.csv");

  if (!response.ok) {
    throw new Error("tier_challenges.csv not found");
  }

  const csvText = await response.text();

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const output: TierChallenges = {
    "High Tier": [],
    "Mid Tier": [],
    "Low Tier": [],
  };

  parsed.data.forEach((row) => {
    const high = safe(
      row.high ||
        row.High ||
        row["High Tier"]
    );

    const mid = safe(
      row.mid ||
        row.Mid ||
        row["Mid Tier"]
    );

    const low = safe(
      row.low ||
        row.Low ||
        row["Low Tier"]
    );

    if (high) output["High Tier"].push(high);
    if (mid) output["Mid Tier"].push(mid);
    if (low) output["Low Tier"].push(low);
  });

  return output;
}

export function pickRandomChallenges(
  items: string[],
  amount: number
): string[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, amount);
}