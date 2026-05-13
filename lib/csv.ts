import Papa from "papaparse";
import type { Player } from "@/types/player";

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function firstPosition(value: unknown): string {
  return String(value ?? "")
    .split(",")[0]
    .trim()
    .toUpperCase();
}

export async function loadPlayersFromCsv(): Promise<Player[]> {
  const response = await fetch("/data/players.csv");

  if (!response.ok) {
    throw new Error("Nem találom a CSV-t. Tedd ide: public/data/players.csv");
  }

  const csvText = await response.text();

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV parse warnings:", parsed.errors);
  }

  return parsed.data
  .map((row, index) => ({
    playerId: String(row.player_id || index),
    name: String(row.short_name || row.long_name || "").trim(),
    longName: String(row.long_name || "").trim(),
    team: String(row.club_name || "").trim(),
    nationality: String(row.nationality_name || "").trim(),
    position: firstPosition(row.player_positions || row.club_position),
    age: toNumber(row.age),
    rating: toNumber(row.overall),
    potential: toNumber(row.potential),
  }))
  .filter((player) => player.name && player.team && player.rating > 0);
}