import type { ChartType, Enriched, ModeFamily } from "../api/types";

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

function accentFor(a: Enriched | undefined): string {
  if (!a) return "#c084fc";
  if (a.chart_type) return CHART_ACCENT[a.chart_type];
  return FAMILY_ACCENT[a.mode_family];
}

// "Nice" rounded step so the axis labels land on round numbers.
function niceStep(range: number, targetTicks: number): number {
  const rough = range / targetTicks;
  const pow = Math.pow(10, Math.floor(Math.log10(rough || 1)));
  const norm = rough / pow;
  const step = norm >= 5 ? 5 : norm >= 2 ? 2 : 1;
  return step * pow;
}

// A trend line of New Score across attempts, oldest to newest, so the player
// can see whether they are improving. Hand-rolled SVG (no charting library) to
// keep the client bundle static and small.
export function ProgressChart({ attempts }: { attempts: Enriched[] }) {
  if (attempts.length === 0) {
    return <div class="progress-empty">No attempts yet.</div>;
  }

  const oldestFirst = [...attempts].sort((a, b) => a.at - b.at);
  const accent = accentFor(oldestFirst[oldestFirst.length - 1]);

  const width = 640;
  const height = 200;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const scores = oldestFirst.map((a) => a.new_score);
  const rawMin = Math.min(...scores);
  const rawMax = Math.max(...scores);
  // Pad the range a bit so points do not sit on the frame; keep a sane floor
  // so a single attempt still gets a readable vertical scale.
  const span = Math.max(rawMax - rawMin, 20_000);
  const lo = Math.max(0, Math.floor((rawMin - span * 0.25) / 1000) * 1000);
  const hi = Math.min(1_000_000, Math.ceil((rawMax + span * 0.25) / 1000) * 1000);
  const range = hi - lo || 1;

  const xFor = (i: number) =>
    oldestFirst.length === 1
      ? padL + plotW / 2
      : padL + (i / (oldestFirst.length - 1)) * plotW;
  const yFor = (score: number) => padT + (1 - (score - lo) / range) * plotH;

  const points = oldestFirst.map((a, i) => ({ x: xFor(i), y: yFor(a.new_score), a }));

  const step = niceStep(range, 4);
  const gridLines: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) gridLines.push(v);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].x},${padT + plotH} L${points[0].x},${padT + plotH} Z`
      : "";

  const fmt = (v: number) =>
    v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v));

  return (
    <svg
      class="progress-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="New Score progress over time"
      style={{ "--chart-accent": accent }}
    >
      <defs>
        <linearGradient id="progress-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={accent} stop-opacity="0.35" />
          <stop offset="100%" stop-color={accent} stop-opacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal gridlines + y-axis labels */}
      {gridLines.map((v) => {
        const y = yFor(v);
        return (
          <g key={v}>
            <line class="progress-grid" x1={padL} y1={y} x2={width - padR} y2={y} />
            <text class="progress-axis-label" x={padL - 8} y={y} text-anchor="end" dominant-baseline="middle">
              {fmt(v)}
            </text>
          </g>
        );
      })}

      {areaPath && <path d={areaPath} fill="url(#progress-area)" />}
      {points.length > 1 && <path class="progress-line" d={linePath} />}

      {points.map((p, i) => (
        <g key={i} class="progress-point">
          <circle class="progress-dot-halo" cx={p.x} cy={p.y} r="9" />
          <circle class="progress-dot" cx={p.x} cy={p.y} r="4" />
          <title>{`${new Date(p.a.at * 1000).toLocaleString()}: ${p.a.new_score.toLocaleString()}`}</title>
        </g>
      ))}
    </svg>
  );
}
