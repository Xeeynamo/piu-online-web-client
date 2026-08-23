// Mirrors the JSON shapes served by web/server/api. Keep field names in sync
// with the Go structs there (see api/auth_handlers.go, api/enrich.go,
// api/player_handlers.go).

export type ModeFamily = "single" | "double" | "coop";

// Fine-grained chart style used for the stepball color and labels. Unlike
// ModeFamily it distinguishes Performance charts.
export type ChartType =
  | "single"
  | "double"
  | "single_performance"
  | "double_performance"
  | "coop"
  | "";

export type Grade =
  | "SSS+"
  | "SSS"
  | "SS+"
  | "SS"
  | "S+"
  | "S"
  | "AAA+"
  | "AAA"
  | "AA+"
  | "AA"
  | "A+"
  | "A"
  | "B"
  | "C"
  | "D"
  | "F";

export type Plate =
  | "Perfect Game"
  | "Ultimate Game"
  | "Extreme Game"
  | "Superb Game"
  | "Marvelous Game"
  | "Talented Game"
  | "Fair Game"
  | "Rough Game";

export interface CardSummary {
  card_id: string;
  player_name: string;
  avatar_index: number;
}

export interface Me {
  sub: string;
  email: string;
  cards: CardSummary[];
}

export interface PlayerSummary {
  player_name: string;
  avatar_index: number;
  level: number;
  experience: number;
  pump_points: number;
  play_count: number;
  last_access: number;
  cleared_songs: number;
  total_charts: number;
  grade_counts: Partial<Record<Grade, number>>;
  plate_counts: Partial<Record<Plate, number>>;
}

export interface Enriched {
  at: number;
  song_id: string;
  song_title?: string;
  difficulty: number;
  difficulty_mode: number;
  mode_family: ModeFamily;
  chart_type: ChartType;
  legacy_score: number;
  new_score: number;
  grade: Grade;
  plate: Plate;
  n_perfect: number;
  n_great: number;
  n_good: number;
  n_bad: number;
  n_miss: number;
  max_combo: number;
  // Play settings. When auto_vel is true the player used AutoVelocity
  // (auto_velocity holds the value); otherwise speed is the manual multiplier.
  auto_vel: boolean;
  auto_velocity: number;
  speed: number;
  rush: number;
}

export interface BestIndexEntry {
  mode_family: ModeFamily;
  difficulty: number;
  chart_count: number;
}

export interface SongChartInfo {
  kind: number;
  level: number;
  mode: string;
  mode_family: ModeFamily;
  chart_type: ChartType;
  name: string;
  best?: Enriched;
}

export interface SongResponse {
  song_id: string;
  title: string;
  artist: string;
  bpm: string;
  charts: SongChartInfo[];
}

export interface SongChartResponse {
  best: Enriched | null;
  attempts: Enriched[];
}
