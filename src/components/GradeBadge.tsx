import type { Grade } from "../api/types";

// Grade tiers rendered from public/assets/grade-badge/*.png. The "+" in a
// tier name maps to the "-plus" file suffix.
function badgeFile(grade: Grade): string {
  return grade.replace("+", "-plus");
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span class="grade-badge" title={grade}>
      <img src={`/assets/grade-badge/${badgeFile(grade)}.png`} alt={grade} />
    </span>
  );
}
