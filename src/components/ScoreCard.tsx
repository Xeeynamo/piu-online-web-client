import type { ChartType, Enriched, ModeFamily } from "../api/types";
import { songById } from "../data/songs";
import { Stepball } from "./Stepball";
import { GradeBadge } from "./GradeBadge";
import { PlateBadge } from "./PlateBadge";
import { JudgmentRow } from "./JudgmentRow";

interface ScoreCardProps {
  result: Enriched;
  onClick?: () => void;
}

// Accent color per chart style, matching the stepball palette. Drives the
// card's edge glow, stripe, and title underline so a Single card reads red,
// a Double card green, and so on.
const CHART_ACCENT: Record<Exclude<ChartType, "">, string> = {
  single: "#e0483e",
  double: "#3ec24f",
  single_performance: "#c084fc",
  double_performance: "#4fa6ff",
  coop: "#e0c93e",
};
const FAMILY_ACCENT: Record<ModeFamily, string> = {
  single: "#e0483e",
  double: "#3ec24f",
  coop: "#e0c93e",
};

function accentFor(chartType: ChartType, modeFamily: ModeFamily): string {
  if (chartType) return CHART_ACCENT[chartType];
  return FAMILY_ACCENT[modeFamily];
}

export function ScoreCard({ result, onClick }: ScoreCardProps) {
  const when = result.at
    ? new Date(result.at * 1000).toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;
  const accent = accentFor(result.chart_type, result.mode_family);
  const song = songById(result.song_id);
  const title = result.song_title ?? song?.title ?? result.song_id;
  const artist = song?.artist;
  return (
    <div
      class="score-card"
      style={{ "--card-accent": accent }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div class="score-card-glow" />

      <div class="score-card-header">
        <Stepball
          chartType={result.chart_type}
          modeFamily={result.mode_family}
          difficulty={result.difficulty}
        />
        <div class="score-card-heading">
          <span class="score-card-title">{title}</span>
          {artist && <span class="score-card-artist">{artist}</span>}
        </div>
      </div>

      <div class="score-card-body">
        <GradeBadge grade={result.grade} />
        <PlateBadge plate={result.plate} />
        <div class="score-card-scoreblock">
          <div class="score-card-score">{result.new_score.toLocaleString()}</div>
          {result.legacy_score > 0 && (
            <div class="score-card-legacy">
              Legacy <b>{result.legacy_score.toLocaleString()}</b>
            </div>
          )}
        </div>
      </div>

      <div class="score-card-judgments">
        <JudgmentRow result={result} />
        {when && <span class="score-card-time">{when}</span>}
      </div>
    </div>
  );
}
