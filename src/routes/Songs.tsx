import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { api } from "../api/client";
import type { BestIndexEntry, Enriched, ModeFamily } from "../api/types";
import { ScoreCard } from "../components/ScoreCard";
import { Stepball } from "../components/Stepball";

type Tab = "recent" | "best";

export function Songs({ card }: { card: string }) {
  const location = useLocation();
  // The header's Recent/Best nav drives the tab through ?tab=; keep them in sync
  // so the active tab and the active nav item always match.
  const tab: Tab =
    new URLSearchParams(location.query as Record<string, string>).get("tab") === "best"
      ? "best"
      : "recent";
  return (
    <div class="screen screen-songs">
      {tab === "recent" ? <RecentlyPlayed card={card} /> : <BestScores card={card} />}
    </div>
  );
}

function RecentlyPlayed({ card }: { card: string }) {
  const [attempts, setAttempts] = useState<Enriched[]>([]);
  const location = useLocation();

  useEffect(() => {
    api.recent(card).then(setAttempts);
  }, [card]);

  return (
    <div class="recent-list">
      {attempts.map((a, i) => (
        <ScoreCard
          key={i}
          result={a}
          onClick={() => location.route(`/player/${card}/song/${a.song_id}`)}
        />
      ))}
    </div>
  );
}

const MODE_LABELS: Record<ModeFamily, string> = {
  single: "Single",
  double: "Double",
  coop: "Co-op / Performance",
};

// Accent color per mode family, matching the stepball / score-card palette.
const MODE_ACCENT: Record<ModeFamily, string> = {
  single: "#e0483e",
  double: "#3ec24f",
  coop: "#e0c93e",
};

function BestScores({ card }: { card: string }) {
  const [index, setIndex] = useState<BestIndexEntry[]>([]);
  const [selected, setSelected] = useState<{ mode: ModeFamily; diff: number } | null>(null);
  const [charts, setCharts] = useState<Enriched[]>([]);
  const location = useLocation();

  useEffect(() => {
    api.bestIndex(card).then(setIndex);
  }, [card]);

  useEffect(() => {
    if (!selected) return;
    api.bestAtDifficulty(card, selected.mode, selected.diff).then(setCharts);
  }, [card, selected]);

  const grouped: Record<ModeFamily, BestIndexEntry[]> = { single: [], double: [], coop: [] };
  for (const e of index) grouped[e.mode_family].push(e);

  if (selected) {
    return (
      <div class="best-drilldown">
        <button type="button" onClick={() => setSelected(null)}>
          &larr; Back
        </button>
        <h2>
          {MODE_LABELS[selected.mode]} {selected.diff}
        </h2>
        <div class="recent-list">
          {charts.map((c, i) => (
            <ScoreCard
              key={i}
              result={c}
              onClick={() => location.route(`/player/${card}/song/${c.song_id}`)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div class="best-grid">
      {(Object.keys(grouped) as ModeFamily[]).map((mode) => (
        <div key={mode} class="best-section" style={{ "--mode-accent": MODE_ACCENT[mode] }}>
          <h2 class="best-section-title">{MODE_LABELS[mode]}</h2>
          <div class="best-difficulty-grid">
            {grouped[mode]
              .sort((a, b) => a.difficulty - b.difficulty)
              .map((e) => (
                <button
                  key={e.difficulty}
                  type="button"
                  class="best-difficulty-tile"
                  onClick={() => setSelected({ mode, diff: e.difficulty })}
                >
                  <Stepball size="hd" modeFamily={mode} difficulty={e.difficulty} />
                  <span class="chart-count">
                    {e.chart_count} chart{e.chart_count === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
