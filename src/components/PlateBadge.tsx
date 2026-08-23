import type { Plate } from "../api/types";

const PLATE_FILE: Record<Plate, string> = {
  "Perfect Game": "s_pg",
  "Ultimate Game": "s_ug",
  "Extreme Game": "s_eg",
  "Superb Game": "s_sg",
  "Marvelous Game": "s_mg",
  "Talented Game": "s_tg",
  "Fair Game": "s_fg",
  "Rough Game": "s_rg",
};

export function PlateBadge({ plate }: { plate: Plate }) {
  return (
    <span class="plate-badge">
      <img src={`/assets/plates/${PLATE_FILE[plate]}.png`} alt={plate} />
      <span class="plate-label">{plate}</span>
    </span>
  );
}
