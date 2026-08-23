import type { ChartType, ModeFamily } from "../api/types";

// Stepball sphere/digit color per chart style:
//   red    = Single
//   green  = Double
//   purple = Single Performance
//   blue   = Double Performance
//   yellow = Co-op
// The color comes from the fine-grained ChartType. When only the coarse
// ModeFamily is known (no matched chart), performance charts fall back to their
// base family's color.
const CHART_COLOR: Record<Exclude<ChartType, "">, string> = {
  single: "red",
  double: "green",
  single_performance: "purple",
  double_performance: "blue",
  coop: "yellow",
};

const FAMILY_COLOR: Record<ModeFamily, string> = {
  single: "red",
  double: "green",
  coop: "yellow",
};

interface StepballProps {
  // Prefer chartType; modeFamily is a fallback when the precise style is
  // unknown. At least one must be provided.
  chartType?: ChartType;
  modeFamily?: ModeFamily;
  difficulty: number;
  size?: "small" | "hd";
}

function colorFor(chartType?: ChartType, modeFamily?: ModeFamily): string {
  if (chartType) return CHART_COLOR[chartType];
  if (modeFamily) return FAMILY_COLOR[modeFamily];
  return "red";
}

export function Stepball({ chartType, modeFamily, difficulty, size = "small" }: StepballProps) {
  const color = colorFor(chartType, modeFamily);
  // Mirror the arcade art, which zero-pads the difficulty to two digits ("04").
  const digits = String(difficulty).padStart(2, "0").split("");
  const sphereSrc = `/assets/stepball/${size}/sphere-${color}.png`;
  const cls = size === "hd" ? "stepball stepball-hd" : "stepball stepball-small";
  const label = chartType || modeFamily || "";

  return (
    <span class={cls} data-color={color}>
      <img src={sphereSrc} class="stepball-sphere" alt={`${label} ${difficulty}`} />
      <span class="stepball-digits">
        {digits.map((d, i) =>
          size === "hd" ? (
            <img key={i} src={`/assets/stepball/hd/digit-${color}-${d}.png`} class="stepball-digit" alt="" />
          ) : (
            <img key={i} src={`/assets/stepball/small/${color}-${d}.png`} class="stepball-digit" alt="" />
          ),
        )}
      </span>
    </span>
  );
}
