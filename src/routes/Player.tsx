import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { api } from "../api/client";
import type { Enriched, Grade, Plate, PlayerSummary } from "../api/types";
import { GradeBadge } from "../components/GradeBadge";
import { PlateBadge } from "../components/PlateBadge";
import { ScoreCard } from "../components/ScoreCard";

const GRADE_ORDER: Grade[] = [
  "SSS+", "SSS", "SS+", "SS", "S+", "S", "AAA+", "AAA",
  "AA+", "AA", "A+", "A", "B", "C", "D", "F",
];

const PLATE_ORDER: Plate[] = [
  "Perfect Game", "Ultimate Game", "Extreme Game", "Superb Game",
  "Marvelous Game", "Talented Game", "Fair Game", "Rough Game",
];

// A grade or plate selection to drill into.
type Drill = { kind: "grade"; value: Grade } | { kind: "plate"; value: Plate };

export function Player({ card }: { card: string }) {
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);

  useEffect(() => {
    api.summary(card).then(setSummary);
  }, [card]);

  if (!summary) return <div class="screen">Loading...</div>;

  const lastAccess = summary.last_access ? new Date(summary.last_access * 1000).toLocaleString() : "never";

  return (
    <div class="screen screen-player">
      <div class="player-banner">
        <img src={`/assets/avatars/${summary.avatar_index}.png`} alt="" class="player-avatar" />
        <div class="player-banner-info">
          <div class="player-name">{summary.player_name}</div>
          <div class="player-meta">
            <span class="player-level-badge">
              <span>Lv</span> {summary.level}
            </span>
            <span class="player-last-access">Last access: {lastAccess}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat">
          <span class="stat-label">Level</span>
          <span class="stat-value">{summary.level}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Play Count</span>
          <span class="stat-value">{summary.play_count}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Experience</span>
          <span class="stat-value">{summary.experience}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Pump Points</span>
          <span class="stat-value">{summary.pump_points}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Cleared songs</span>
          <span class="stat-value">
            {summary.cleared_songs} / {summary.total_charts}
          </span>
        </div>
      </div>

      <h2 class="section-title">Grade</h2>
      <div class="grade-grid">
        {GRADE_ORDER.map((g) => {
          const count = summary.grade_counts[g] ?? 0;
          return (
            <button
              key={g}
              type="button"
              class="grade-tile"
              disabled={count === 0}
              onClick={() => setDrill({ kind: "grade", value: g })}
            >
              <GradeBadge grade={g} />
              <span class="grade-tile-count">{count}</span>
            </button>
          );
        })}
      </div>

      <h2 class="section-title">Plate</h2>
      <div class="plate-grid">
        {PLATE_ORDER.map((p) => {
          const count = summary.plate_counts[p] ?? 0;
          return (
            <button
              key={p}
              type="button"
              class="plate-tile"
              disabled={count === 0}
              onClick={() => setDrill({ kind: "plate", value: p })}
            >
              <PlateBadge plate={p} />
              <span class="plate-tile-count">{count}</span>
            </button>
          );
        })}
      </div>

      {drill && <DrillModal card={card} drill={drill} onClose={() => setDrill(null)} />}
    </div>
  );
}

// DrillModal lists every chart whose best play is at the selected grade or
// plate, using the same ScoreCard as the song lists.
function DrillModal({ card, drill, onClose }: { card: string; drill: Drill; onClose: () => void }) {
  const [charts, setCharts] = useState<Enriched[] | null>(null);
  const location = useLocation();

  useEffect(() => {
    setCharts(null);
    const p =
      drill.kind === "grade"
        ? api.bestByGrade(card, drill.value)
        : api.bestByPlate(card, drill.value);
    p.then(setCharts);
  }, [card, drill.kind, drill.value]);

  return (
    <div class="drill-overlay" onClick={onClose}>
      <div class="drill-panel" onClick={(e) => e.stopPropagation()}>
        <div class="drill-header">
          <h2>
            {drill.kind === "grade" ? "Grade " : "Plate: "}
            {drill.value}
          </h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {charts === null ? (
          <div>Loading...</div>
        ) : charts.length === 0 ? (
          <div>No charts at this {drill.kind}.</div>
        ) : (
          <div class="recent-list">
            {charts.map((c, i) => (
              <ScoreCard
                key={i}
                result={c}
                onClick={() => location.route(`/player/${card}/song/${c.song_id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
