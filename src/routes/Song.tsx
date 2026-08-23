import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { api } from "../api/client";
import type { ChartType, ModeFamily, SongResponse } from "../api/types";
import { GradeBadge } from "../components/GradeBadge";
import { PlateBadge } from "../components/PlateBadge";
import { Stepball } from "../components/Stepball";

// Accent color per chart style, matching the stepball / score-card palette.
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

function chartAccent(ct: ChartType, mf: ModeFamily): string {
  return ct ? CHART_ACCENT[ct] : FAMILY_ACCENT[mf];
}

export function Song({ card, songId }: { card: string; songId: string }) {
  const [song, setSong] = useState<SongResponse | null>(null);
  const location = useLocation();

  useEffect(() => {
    api.song(card, songId).then(setSong);
  }, [card, songId]);

  if (!song) return <div class="screen">Loading...</div>;

  return (
    <div class="screen screen-song">
      <h1>{song.title}</h1>
      <p class="song-artist">{song.artist}</p>
      <p class="song-bpm">BPM {song.bpm}</p>

      <div class="chart-list">
        {song.charts.map((c, i) => (
          <div
            key={i}
            class={`chart-row${c.best ? "" : " chart-row-unplayed"}`}
            style={{ "--row-accent": chartAccent(c.chart_type, c.mode_family) }}
            onClick={() => location.route(`/player/${card}/song/${songId}/${c.mode_family}/${c.level}`)}
          >
            <Stepball chartType={c.chart_type} modeFamily={c.mode_family} difficulty={c.level} />
            {c.best ? (
              <div class="chart-result">
                <GradeBadge grade={c.best.grade} />
                <PlateBadge plate={c.best.plate} />
                <span class="chart-score">{c.best.new_score.toLocaleString()}</span>
              </div>
            ) : (
              <span class="chart-unplayed">Not played</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
