import { useEffect, useState } from "preact/hooks";
import { api } from "../api/client";
import type { ChartType, ModeFamily, SongChartResponse, SongResponse } from "../api/types";
import { songById } from "../data/songs";
import { AttemptCard } from "../components/AttemptCard";
import { ProgressChart } from "../components/ProgressChart";
import { Stepball } from "../components/Stepball";

interface SongChartProps {
  card: string;
  songId: string;
  mode: string;
  diff: string;
}

export function SongChart({ card, songId, mode, diff }: SongChartProps) {
  const [data, setData] = useState<SongChartResponse | null>(null);
  const [song, setSong] = useState<SongResponse | null>(null);

  useEffect(() => {
    api.songChart(card, songId, mode, Number(diff)).then(setData);
  }, [card, songId, mode, diff]);

  useEffect(() => {
    api.song(card, songId).then(setSong);
  }, [card, songId]);

  if (!data) return <div class="screen">Loading...</div>;

  const level = Number(diff);
  // The precise chart style (for the stepball color) comes from an attempt when
  // one exists; otherwise fall back to the coarse family from the URL.
  const chartType: ChartType = data.best?.chart_type ?? data.attempts[0]?.chart_type ?? "";
  const modeFamily = mode as ModeFamily;

  // Title/artist come from the bundled song list (reliable); BPM only from the
  // server's song endpoint, which may not know every song.
  const local = songById(songId);
  const title = local?.title ?? song?.title ?? songId;
  const artist = local?.artist ?? song?.artist;
  const bpm = song?.bpm;

  return (
    <div class="screen screen-song-chart">
      <div class="chart-hero">
        <Stepball size="hd" chartType={chartType} modeFamily={modeFamily} difficulty={level} />
        <div class="chart-hero-info">
          <h1 class="chart-hero-title">{title}</h1>
          {artist && <p class="chart-hero-artist">{artist}</p>}
          {bpm && <p class="chart-hero-bpm">BPM {bpm}</p>}
        </div>
      </div>

      {data.best && (
        <section>
          <h2>Best</h2>
          <AttemptCard result={data.best} />
        </section>
      )}

      <section>
        <h2>Progress</h2>
        <ProgressChart attempts={data.attempts} />
      </section>

      <section>
        <h2>All Attempts</h2>
        <div class="recent-list">
          {[...data.attempts]
            .sort((a, b) => b.at - a.at)
            .map((a, i) => (
              <AttemptCard key={i} result={a} />
            ))}
        </div>
      </section>
    </div>
  );
}
