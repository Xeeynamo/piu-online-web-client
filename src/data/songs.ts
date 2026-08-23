import raw from "./songs.json";

export interface SongChart {
  level: number;
  mode: string;
}

export interface Song {
  id: string;
  channel: string;
  title: string;
  artist: string;
  charts: SongChart[];
}

export const songs: Song[] = raw;

const byId = new Map<string, Song>(songs.map((s) => [s.id, s]));

export function songById(id: string): Song | undefined {
  return byId.get(id);
}
