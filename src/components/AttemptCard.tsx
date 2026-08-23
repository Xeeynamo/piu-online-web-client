import type { ChartType, Enriched, ModeFamily } from "../api/types";
import { GradeBadge } from "./GradeBadge";
import { PlateBadge } from "./PlateBadge";

interface AttemptCardProps {
  result: Enriched;
}

// Accent per chart style, matching the stepball / score-card palette.
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

function speedLabel(r: Enriched): string {
  return r.auto_vel ? `AV ${r.auto_velocity}` : `${r.speed.toFixed(1)}x`;
}

// A single play on the per-chart page. The song and chart are already named by
// the page header, so this card drops that context and focuses on the result
// and the settings the play used.
export function AttemptCard({ result }: AttemptCardProps) {
  const accent = accentFor(result.chart_type, result.mode_family);
  const when = result.at
    ? new Date(result.at * 1000).toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  const judgments: Array<{ label: string; value: number; cls: string }> = [
    { label: "Perfect", value: result.n_perfect, cls: "judgment-perfect" },
    { label: "Great", value: result.n_great, cls: "judgment-great" },
    { label: "Good", value: result.n_good, cls: "judgment-good" },
    { label: "Bad", value: result.n_bad, cls: "judgment-bad" },
    { label: "Miss", value: result.n_miss, cls: "judgment-miss" },
  ];

  return (
    <div class="attempt-card" style={{ "--card-accent": accent }}>
      <div class="attempt-card-main">
        <div class="attempt-card-topline">
          <div class="attempt-card-badges">
            <GradeBadge grade={result.grade} />
            <PlateBadge plate={result.plate} />
          </div>
          <div class="attempt-card-scoreblock">
            <div class="attempt-card-score">{result.new_score.toLocaleString()}</div>
            {when && <div class="attempt-card-time">{when}</div>}
          </div>
        </div>

        <div class="attempt-stats">
          {judgments.map((j) => (
            <div key={j.label} class={`attempt-stat ${j.cls}`}>
              <span class="attempt-stat-label">{j.label}</span>
              <span class="attempt-stat-value">{j.value.toLocaleString()}</span>
            </div>
          ))}
          <div class="attempt-stat attempt-stat-combo">
            <span class="attempt-stat-label">Max Combo</span>
            <span class="attempt-stat-value">{result.max_combo.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="attempt-settings">
        <div class="attempt-setting">
          <span class="attempt-setting-label">{result.auto_vel ? "Auto Velocity" : "Speed"}</span>
          <span class="attempt-setting-value">{speedLabel(result)}</span>
        </div>
        <div class="attempt-setting">
          <span class="attempt-setting-label">Rush</span>
          <span class="attempt-setting-value">{result.rush.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
