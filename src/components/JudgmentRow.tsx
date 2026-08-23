import type { Enriched } from "../api/types";

export function JudgmentRow({ result }: { result: Enriched }) {
  return (
    <div class="judgment-row">
      <span class="judgment judgment-perfect" title="Perfect">{result.n_perfect}</span>
      <span class="judgment judgment-great" title="Great">{result.n_great}</span>
      <span class="judgment judgment-good" title="Good">{result.n_good}</span>
      <span class="judgment judgment-bad" title="Bad">{result.n_bad}</span>
      <span class="judgment judgment-miss" title="Miss">{result.n_miss}</span>
    </div>
  );
}
