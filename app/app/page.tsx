"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { loadPlayersFromCsv } from "@/lib/csv";
import { evaluatePlayer } from "@/lib/rules";
import {
  getOrCreateMonthlyUsage,
  incrementUsage,
} from "@/lib/usage";
import {
  loadCareerIdeas,
  loadTierChallenges,
  pickRandomChallenges,
} from "@/lib/careerIdeas";
import type { EvaluatedPlayer, Player } from "@/types/player";
import type { CareerIdea, TierChallenges } from "@/types/careerIdea";

type View = "landing" | "squad-iq" | "regen-lab" | "career-ideas";
type CareerFilterKey = "category" | "nation" | "league" | "difficulty";

function resultClass(result: string): string {
  const r = result.toLowerCase();
  if (r.includes("sell")) return "sell";
  if (r.includes("leader")) return "leader";
  if (r.includes("star")) return "star";
  if (r.includes("wonderkid")) return "wonderkid";
  if (r.includes("loan")) return "loan";
  if (r.includes("first team")) return "first-team";
  if (r.includes("keep")) return "first-team";
  return "backup";
}

function average(
  players: EvaluatedPlayer[],
  key: "age" | "rating" | "potential" | "growth"
): string {
  if (players.length === 0) return "-";
  const total = players.reduce((sum, p) => sum + p[key], 0);
  return (total / players.length).toFixed(1);
}

function uniqueValues(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function regenRoles(position: string): string[] {
  const map: Record<string, string[]> = {
    GK: ["Goalkeeper", "Sweeper Keeper"],
    RB: ["Fullback", "Wingback", "Inverted Wingback"],
    LB: ["Fullback", "Wingback", "Inverted Wingback"],
    CB: ["Defender", "Stopper", "Ball-Playing Defender"],
    CDM: ["Holding", "Deep-Lying Playmaker", "Centre-Half"],
    CM: ["Box-to-Box", "Playmaker", "Holding"],
    CAM: ["Classic 10", "Shadow Striker", "Playmaker"],
    RM: ["Winger", "Wide Midfielder", "Inside Forward"],
    LM: ["Winger", "Wide Midfielder", "Inside Forward"],
    RW: ["Winger", "Inside Forward"],
    LW: ["Winger", "Inside Forward"],
    ST: ["Poacher", "Advanced Forward", "Target Forward"],
  };

  return map[position] || ["Balanced Role"];
}

function positionLabel(position: string): string {
  const map: Record<string, string> = {
    GK: "Goalkeeper",
    RB: "Right Back",
    LB: "Left Back",
    CB: "Centre Back",
    CDM: "Defensive Midfielder",
    CM: "Central Midfielder",
    CAM: "Attacking Midfielder",
    RM: "Right Midfielder",
    LM: "Left Midfielder",
    RW: "Right Wing",
    LW: "Left Wing",
    ST: "Striker",
  };

  return map[position] || "Player Position";
}

export default function HomePage() {
      const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
console.log(data.user);
console.log("AUTH USER ID:", data.user?.id);
console.log("AUTH USER EMAIL:", data.user?.email);
      if (!data.user) {
  window.location.href = "/auth";
  return;
}

const usageData = await getOrCreateMonthlyUsage(data.user.id);

const { data: profileData } = await supabase
  .from("profiles")
  .select("plan, stripe_customer_id")
  .eq("id", data.user.id)
  .single();

setUsage(usageData);
console.log("PROFILE DATA:", profileData);
setPlan(profileData?.plan || "free");
setStripeCustomerId(profileData?.stripe_customer_id || null);
setAuthLoading(false);
    }

    checkUser();
  }, []);

  
  const [view, setView] = useState<View>("landing");
const [usage, setUsage] = useState<any>(null);
const [plan, setPlan] = useState<"free" | "pro" | "ultimate">("free");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [careerIdeas, setCareerIdeas] = useState<CareerIdea[]>([]);
  const [tierChallenges, setTierChallenges] = useState<TierChallenges>({
    "High Tier": [],
    "Mid Tier": [],
    "Low Tier": [],
  });
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [ideasError, setIdeasError] = useState("");

  const [teamQuery, setTeamQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [division, setDivision] = useState<number | "">("");

  const [regenQuery, setRegenQuery] = useState("");
  const [selectedRegenPlayer, setSelectedRegenPlayer] = useState<Player | null>(null);

  const [ideaQuery, setIdeaQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<CareerIdea | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [nationFilter, setNationFilter] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const limits = {
  free: {
    squad: 3,
    regen: 5,
    ideas: 5,
  },
  pro: {
    squad: 10,
    regen: 20,
    ideas: 10,
  },
  ultimate: {
    squad: Infinity,
    regen: Infinity,
    ideas: Infinity,
  },
};

  useEffect(() => {
    loadPlayersFromCsv()
      .then(setPlayers)
      .catch((err) => setError(err instanceof Error ? err.message : "CSV loading error"))
      .finally(() => setLoading(false));

    Promise.all([loadCareerIdeas(), loadTierChallenges()])
      .then(([ideas, challenges]) => {
        setCareerIdeas(ideas);
        setTierChallenges(challenges);
      })
      .catch((err) =>
        setIdeasError(err instanceof Error ? err.message : "Career Ideas loading error")
      )
      .finally(() => setIdeasLoading(false));
  }, []);

  const teams = useMemo(() => uniqueValues(players.map((p) => p.team)), [players]);

  const showSuggestions = teamQuery.trim().length > 0 && teamQuery !== selectedTeam;

  const filteredTeams = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    if (!q) return [];
    return teams.filter((team) => team.toLowerCase().includes(q)).slice(0, 12);
  }, [teamQuery, teams]);

  const squad = useMemo<EvaluatedPlayer[]>(() => {
    if (!selectedTeam || division === "") return [];
    return players
      .filter((p) => p.team === selectedTeam)
      .map((p) => evaluatePlayer(p, division))
      .sort((a, b) => b.rating - a.rating);
  }, [players, selectedTeam, division]);

  const canShowSquad = Boolean(selectedTeam && division !== "");

  const showRegenSuggestions =
    regenQuery.trim().length > 0 && selectedRegenPlayer?.name !== regenQuery;

  const filteredRegenPlayers = useMemo(() => {
    const q = regenQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    return players
      .filter((p) => p.name.toLowerCase().includes(q) || p.longName.toLowerCase().includes(q))
      .sort((a, b) => b.potential - a.potential || b.rating - a.rating)
      .slice(0, 12);
  }, [players, regenQuery]);

  function rarityTier(nationality: string): string {
    const count = players.filter((p) => p.nationality === nationality).length;
    if (count <= 5) return "Very Rare";
    if (count <= 20) return "Rare";
    if (count <= 60) return "Uncommon";
    return "Common";
  }

  function legendTier(player: Player): string {
    if (player.rating >= 88) return "Legendary";
    if (player.rating >= 84) return "World Class";
    if (player.rating >= 78) return "Mid";
    return "Not legendary";
  }

  function filterCareerIdeas(exclude?: CareerFilterKey): CareerIdea[] {
    const q = ideaQuery.trim().toLowerCase();

    return careerIdeas.filter((idea) => {
      const matchesSearch = !q || idea.clubName.toLowerCase().includes(q);
      const matchesCategory =
        exclude === "category" || !categoryFilter || idea.category === categoryFilter;
      const matchesNation = exclude === "nation" || !nationFilter || idea.nation === nationFilter;
      const matchesLeague = exclude === "league" || !leagueFilter || idea.league === leagueFilter;
      const matchesDifficulty =
        exclude === "difficulty" || !difficultyFilter || idea.difficulty === difficultyFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesNation &&
        matchesLeague &&
        matchesDifficulty
      );
    });
  }

  const categoryOptions = useMemo(
    () => uniqueValues(filterCareerIdeas("category").map((idea) => idea.category)),
    [careerIdeas, ideaQuery, nationFilter, leagueFilter, difficultyFilter]
  );

  const nationOptions = useMemo(
    () => uniqueValues(filterCareerIdeas("nation").map((idea) => idea.nation)),
    [careerIdeas, ideaQuery, categoryFilter, leagueFilter, difficultyFilter]
  );

  const leagueOptions = useMemo(
    () => uniqueValues(filterCareerIdeas("league").map((idea) => idea.league)),
    [careerIdeas, ideaQuery, categoryFilter, nationFilter, difficultyFilter]
  );

  const difficultyOptions = useMemo(
    () => uniqueValues(filterCareerIdeas("difficulty").map((idea) => idea.difficulty)),
    [careerIdeas, ideaQuery, categoryFilter, nationFilter, leagueFilter]
  );

  const filteredCareerIdeas = useMemo(() => {
    return filterCareerIdeas().slice(0, 30);
  }, [careerIdeas, ideaQuery, categoryFilter, nationFilter, leagueFilter, difficultyFilter]);

  function selectCareerIdea(idea: CareerIdea) {
    setSelectedIdea(idea);
    setIdeaQuery(idea.clubName);
    setSelectedChallenges(pickRandomChallenges(tierChallenges[idea.category] || [], 5));
  }

  function resetCareerIdeaFilters() {
    setIdeaQuery("");
    setSelectedIdea(null);
    setCategoryFilter("");
    setNationFilter("");
    setLeagueFilter("");
    setDifficultyFilter("");
    setSelectedChallenges([]);
  }
if (authLoading) {
    return (
      <main className="page">
        <section className="card" style={{ padding: 32 }}>
          <div className="kicker">Career Mode Universe</div>
          <h1>Loading...</h1>
          <p className="sub">Checking your account access.</p>
        </section>
      </main>
    );
  }
  if (view === "landing") {
    return (
      <main className="page landing-page">
        <section className="landing-hero card">

  <div className="landing-topbar">
    <div>
      <p className="kicker">Career Mode Universe</p>
    </div>

    <div className="landing-nav">
      <a href="/pricing" className="landing-link">
        Pricing
      </a>

      <button
        className="landing-button secondary"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  </div>

  <h1>Career Mode Universe</h1>
          <p className="sub">
            A premium Career Mode companion platform built for smarter saves, realistic
            rebuilds, and better squad decisions.
          </p>
           {usage && (
  <div
    className="card"
    style={{
      marginTop: 20,
      padding: 20,
      display: "grid",
      gap: 10,
    }}
  >
    <div>
      Squad IQ uses this month:{" "}
      <strong>
        {usage.squad_iq_used}/
        {plan === "ultimate" ? "∞" : limits[plan].squad}
      </strong>
    </div>

    <div>
      Regen Lab uses this month:{" "}
      <strong>
        {usage.regen_used}/
        {plan === "ultimate" ? "∞" : limits[plan].regen}
      </strong>
    </div>

    <div>
      Career Ideas uses this month:{" "}
      <strong>
        {usage.career_ideas_used}/
        {plan === "ultimate" ? "∞" : limits[plan].ideas}
      </strong>
    </div>
  </div>
)}

<a
  href="/pricing"
  className="landing-button primary"
  style={{ marginTop: 18, display: "inline-block" }}
>
  Upgrade / View Plans
</a>
{stripeCustomerId && (
  <button
    className="landing-button secondary"
    style={{ marginTop: 12, display: "inline-block" }}
    onClick={async () => {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: stripeCustomerId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      window.location.href = data.url;
    }}
  >
    Manage Subscription
  </button>
)}
        </section>

        <section className="tool-grid">
          <button className="tool-card card active-tool" onClick={() => setView("squad-iq")}
  >
            <span className="tool-kicker">Tool 01</span>
            <strong>Squad IQ</strong>
            <span>Analyze your squad and instantly see who to keep, loan, sell, or build around.</span>
          </button>

          <button className="tool-card card active-tool" onClick={() => setView("regen-lab")}>
            <span className="tool-kicker">Tool 02</span>
            <strong>Regen Lab</strong>
            <span>
              Search a player and discover the regen setup: nationality, position, rarity and
              focused roles.
            </span>
          </button>

          <button className="tool-card card active-tool" onClick={() => setView("career-ideas")}>
            <span className="tool-kicker">Tool 03</span>
            <strong>Career Mode Ideas</strong>
            <span>Discover clubs, filter save ideas, and generate tier-matched career challenges.</span>
          </button>
        </section>
      </main>
    );
  }

  if (view === "career-ideas") {
    return (
      <main className="page">
        <section className="hero">
          <div className="card hero-main">
            <div className="kicker">Career Mode Universe</div>
            <h1>Career Mode Ideas</h1>
            <p className="sub">
              Search a club or filter by category, nation, league and difficulty to discover your
              next EA FC26 career save.
            </p>
          </div>

          <div className="card controls">
            <button className="suggestion" type="button" onClick={() => setView("landing")}>
              ← Back to tools
            </button>

            <div>
              <label>Club search</label>
              <input
                value={ideaQuery}
                onChange={(e) => {
                  setIdeaQuery(e.target.value);
                  setSelectedIdea(null);
                  setSelectedChallenges([]);
                }}
                placeholder="Start typing a club name..."
              />
            </div>

            <div className="ideas-filter-grid">
              <div>
                <label>Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setSelectedIdea(null);
                    setSelectedChallenges([]);
                  }}
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Nation</label>
                <select
                  value={nationFilter}
                  onChange={(e) => {
                    setNationFilter(e.target.value);
                    setSelectedIdea(null);
                    setSelectedChallenges([]);
                  }}
                >
                  <option value="">All nations</option>
                  {nationOptions.map((nation) => (
                    <option key={nation} value={nation}>
                      {nation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>League</label>
                <select
                  value={leagueFilter}
                  onChange={(e) => {
                    setLeagueFilter(e.target.value);
                    setSelectedIdea(null);
                    setSelectedChallenges([]);
                  }}
                >
                  <option value="">All leagues</option>
                  {leagueOptions.map((league) => (
                    <option key={league} value={league}>
                      {league}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value);
                    setSelectedIdea(null);
                    setSelectedChallenges([]);
                  }}
                >
                  <option value="">All difficulties</option>
                  {difficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="suggestion" type="button" onClick={resetCareerIdeaFilters}>
              Reset filters
            </button>

            {ideasLoading && <div className="empty compact-empty">Loading career ideas...</div>}
            {ideasError && <div className="empty compact-empty">{ideasError}</div>}
          </div>
        </section>

        {selectedIdea ? (
          <section className="card career-idea-detail">
            <div className="career-idea-header">
              <div>
                <div className="career-tier-label">{selectedIdea.category}</div>
                <h2>{selectedIdea.clubName}</h2>
                <p>
                  {selectedIdea.nation} • {selectedIdea.league}
                </p>
              </div>

              <div className="career-meta-box">
                <span>Difficulty</span>
                <strong>{selectedIdea.difficulty}</strong>
              </div>
            </div>

            <div className="career-info-grid">
              <div className="career-info-card">
                <span>Nation</span>
                <strong>{selectedIdea.nation}</strong>
              </div>

              <div className="career-info-card">
                <span>League</span>
                <strong>{selectedIdea.league}</strong>
              </div>

              <div className="career-info-card">
                <span>Tier</span>
                <strong>{selectedIdea.category}</strong>
              </div>
            </div>

            <div className="challenge-panel">
              <div className="challenge-header">
                <div>
                  <div className="kicker">Dynamic Challenge Pack</div>
                  <h3>Random 5 challenges</h3>
                  <p>These challenges are matched to the selected club tier.</p>
                </div>

                <button
                  className="challenge-reroll"
                  type="button"
                  onClick={() =>
                    setSelectedChallenges(
                      pickRandomChallenges(tierChallenges[selectedIdea.category] || [], 5)
                    )
                  }
                >
                  Reroll challenges
                </button>
              </div>

              <div className="challenge-list">
                {selectedChallenges.map((challenge, index) => (
                  <div className="challenge-item" key={`${challenge}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{challenge}</strong>
                  </div>
                ))}

                {selectedChallenges.length === 0 && (
                  <div className="empty compact-empty">No challenges found for this tier.</div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="ideas-grid">
            {filteredCareerIdeas.map((idea) => (
              <article className="card idea-card" key={idea.id}>
                <div className="idea-card-top">
                  <div>
                    <div className="kicker">{idea.category}</div>
                    <h2>{idea.clubName}</h2>
                    <p>
                      {idea.nation} • {idea.league}
                    </p>
                  </div>

                  <span className="badge star">{idea.difficulty}</span>
                </div>

                <button
  className="suggestion"
  type="button"
  onClick={async () => {
    if (!usage) return;

    if (usage.career_ideas_used >= limits[plan].ideas) {
      alert("Monthly Career Ideas limit reached. Upgrade your plan.");
      window.location.href = "/pricing";
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    const updatedUsage = await incrementUsage(
      data.user.id,
      "career_ideas_used"
    );

    setUsage(updatedUsage);

    selectCareerIdea(idea);
  }}
>
  Generate career idea →
</button>
              </article>
            ))}

            {!ideasLoading && !ideasError && filteredCareerIdeas.length === 0 && (
              <section className="card empty-state">
                <div className="empty">No career ideas found with these filters.</div>
              </section>
            )}
          </section>
        )}
      </main>
    );
  }

  if (view === "regen-lab") {
    return (
      <main className="page">
        <section className="hero">
          <div className="card hero-main">
            <div className="kicker">Career Mode Universe</div>
            <h1>Regen Lab</h1>
            <p className="sub">
              Search a player and get a clear regen setup: nationality, position, rarity, legend
              level and focused roles.
            </p>
          </div>

          <div className="card controls">
            <button className="suggestion" type="button" onClick={() => setView("landing")}>
              ← Back to tools
            </button>

            <div>
              <label>Player search</label>
              <input
                value={regenQuery}
                onChange={(e) => {
                  setRegenQuery(e.target.value);
                  if (selectedRegenPlayer?.name !== e.target.value) {
                    setSelectedRegenPlayer(null);
                  }
                }}
                placeholder="Start typing a player name..."
              />
            </div>

            {showRegenSuggestions && (
              <div className="suggestions">
                {loading && <div className="empty compact-empty">Loading player database...</div>}
                {error && <div className="empty compact-empty">{error}</div>}

                {!loading &&
                  !error &&
                  filteredRegenPlayers.map((player) => (
                    <button
                      className="suggestion"
                      key={`${player.playerId}-${player.name}`}
                      type="button"
                      onClick={async () => {
  if (!usage) return;

  if (usage.regen_used >= limits[plan].regen) {
    alert("Monthly Regen Lab limit reached. Upgrade your plan.");
    window.location.href = "/pricing";
    return;
  }

  const { data } = await supabase.auth.getUser();

  if (!data.user) return;

  const updatedUsage = await incrementUsage(
    data.user.id,
    "regen_used"
  );

  setUsage(updatedUsage);

  setSelectedRegenPlayer(player);
  setRegenQuery(player.name);
}}
                    >
                      {player.name} — {player.age} • {player.position} •{" "}
                      {player.nationality || "Unknown"}
                    </button>
                  ))}

                {!loading && !error && filteredRegenPlayers.length === 0 && (
                  <div className="empty compact-empty">No players found.</div>
                )}
              </div>
            )}
          </div>
        </section>

        {!selectedRegenPlayer ? (
          <section className="card empty-state">
            <div className="empty">Search and select one player to generate a Regen Lab setup.</div>
          </section>
        ) : (
          <section className="card regen-premium-card">
            <div className="regen-premium-header">
              <div>
                <h2>{selectedRegenPlayer.name}</h2>
                <p>
                  {selectedRegenPlayer.age} years old <span>•</span>{" "}
                  <strong>OVR {selectedRegenPlayer.rating}</strong>
                </p>
              </div>

              <div className="regen-tier-row">
                <div className="regen-tier-card rarity">
                  <span>Rarity</span>
                  <strong>{rarityTier(selectedRegenPlayer.nationality)}</strong>
                </div>

                <div className="regen-tier-card legend">
                  <span>Legend</span>
                  <strong>{legendTier(selectedRegenPlayer)}</strong>
                </div>
              </div>
            </div>

            <div className="regen-divider" />

            <div className="regen-core-grid">
              <div className="regen-core-item">
                <div className="regen-core-icon">🌍</div>
                <span>Nationality</span>
                <strong>{selectedRegenPlayer.nationality || "Unknown"}</strong>
              </div>

              <div className="regen-core-item">
                <div className="regen-core-icon">📍</div>
                <span>Position</span>
                <strong>{selectedRegenPlayer.position}</strong>
                <em>{positionLabel(selectedRegenPlayer.position)}</em>
              </div>

              <div className="regen-core-item">
                <div className="regen-core-icon">✦</div>
                <span>Focused Roles</span>
                <div className="regen-premium-roles">
                  {regenRoles(selectedRegenPlayer.position).map((role) => (
                    <span key={role}>{role}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="card hero-main">
          <div className="kicker">Career Mode Universe</div>
          <h1>Squad IQ</h1>
          <p className="sub">
            Search a team, choose the division ruleset, and instantly see who to keep, sell, loan, or
            build around.
          </p>
        </div>

        <div className="card controls">
          <button className="suggestion" type="button" onClick={() => setView("landing")}>
            ← Back to tools
          </button>

          <div>
            <label>Team selector</label>
            <input
              value={teamQuery}
              onChange={(e) => {
                setTeamQuery(e.target.value);
                if (e.target.value !== selectedTeam) setSelectedTeam("");
              }}
              placeholder="Start typing a club name..."
            />
          </div>

          {showSuggestions && (
            <div className="suggestions">
              {loading && <div className="empty compact-empty">Loading player database...</div>}
              {error && <div className="empty compact-empty">{error}</div>}

              {!loading &&
                !error &&
                filteredTeams.map((team) => (
                  <button
                    className="suggestion"
                    key={team}
                    type="button"
                    onClick={() => {
                      setSelectedTeam(team);
                      setTeamQuery(team);
                      setDivision("");
                    }}
                  >
                    {team}
                  </button>
                ))}

              {!loading && !error && filteredTeams.length === 0 && (
                <div className="empty compact-empty">No teams found.</div>
              )}
            </div>
          )}

          {selectedTeam && (
            <div className="selected-team">
              Selected team: <strong>{selectedTeam}</strong>
            </div>
          )}

          {selectedTeam && (
            <div>
              <label>Choose the division your team plays in</label>
              
    <select
  value={division}
  onChange={async (e) => {
    const selectedDivision = Number(e.target.value);

    setDivision(selectedDivision);

    if (!usage) return;

    if (usage.squad_iq_used >= limits[plan].squad) {
      alert("Monthly Squad IQ limit reached. Upgrade your plan.");
      window.location.href = "/pricing";
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    const updatedUsage = await incrementUsage(
      data.user.id,
      "squad_iq_used"
    );

    setUsage(updatedUsage);
  }}
>
                <option value="">Select division...</option>
                <option value={1}>Division 1</option>
                <option value={2}>Division 2</option>
                <option value={3}>Division 3</option>
                <option value={4}>Division 4</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {canShowSquad ? (
        <>
          <section className="stats-grid">
            <div className="card stat">
              <div className="stat-value">{squad.length || "-"}</div>
              <div className="stat-label">Players loaded</div>
            </div>
            <div className="card stat">
              <div className="stat-value">{average(squad, "rating")}</div>
              <div className="stat-label">Average rating</div>
            </div>
            <div className="card stat">
              <div className="stat-value">{average(squad, "age")}</div>
              <div className="stat-label">Average age</div>
            </div>
            <div className="card stat">
              <div className="stat-value">{average(squad, "growth")}</div>
              <div className="stat-label">Average growth</div>
            </div>
          </section>

          <section className="card table-wrap desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Age</th>
                  <th>Rating</th>
                  <th>Potential</th>
                  <th>Growth</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {squad.map((p) => (
                  <tr key={`${p.name}-${p.team}-${p.position}`}>
                    <td className="player-name">{p.name}</td>
                    <td>{p.position}</td>
                    <td>{p.age}</td>
                    <td>{p.rating}</td>
                    <td>{p.potential}</td>
                    <td>{p.growth > 0 ? `+${p.growth}` : p.growth}</td>
                    <td>
                      <span className={`badge ${resultClass(p.result)}`}>{p.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mobile-player-list">
            {squad.map((p) => (
              <article className="card player-card" key={`mobile-${p.name}-${p.team}-${p.position}`}>
                <div className="player-card-top">
                  <div>
                    <div className="player-card-name">{p.name}</div>
                    <div className="player-card-meta">
                      {p.position} • {p.age} years old
                    </div>
                  </div>
                  <span className={`badge ${resultClass(p.result)}`}>{p.result}</span>
                </div>

                <div className="player-card-stats">
                  <div>
                    <span>Rating</span>
                    <strong>{p.rating}</strong>
                  </div>
                  <div>
                    <span>Potential</span>
                    <strong>{p.potential}</strong>
                  </div>
                  <div>
                    <span>Growth</span>
                    <strong>{p.growth > 0 ? `+${p.growth}` : p.growth}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className="card empty-state">
          <div className="empty">
            {!selectedTeam
              ? "Choose a team to start Squad IQ."
              : "Choose the division your team plays in to load Squad IQ recommendations."}
          </div>
        </section>
      )}
    </main>
  );
}