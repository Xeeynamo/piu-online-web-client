#!/usr/bin/env bash
#
# Losslessly optimize the PNGs under public/assets/ with a pinned oxipng, so the
# bytes we deploy are always minimized.
#
#   ./scripts/optimize-png.sh            optimize the PNGs in place
#   ./scripts/optimize-png.sh --check    fail if any PNG is not already optimal
#                                        (used by CI; makes no changes)
#
# oxipng is pinned by version + sha256 and the statically linked musl build is
# used so it needs no system libraries on any runner. The optimization is
# lossless (no palette changes): --strip safe drops only non-image metadata.

set -euo pipefail

OXIPNG_VERSION="10.2.0"
OXIPNG_SHA256="a27ecb29faab9da1549f4a243bab12f1e43e4ed8ae6a2a2186a543dc9ffd3956"
OXIPNG_URL="https://github.com/oxipng/oxipng/releases/download/v${OXIPNG_VERSION}/oxipng-${OXIPNG_VERSION}-x86_64-unknown-linux-musl.tar.gz"
OXIPNG_ARGS=(-o max --strip safe --quiet)

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
assets_dir="$repo_root/public/assets"
cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/piu-oxipng/$OXIPNG_VERSION"
oxipng="$cache_dir/oxipng"

# Download and verify the pinned binary once, caching it for reuse.
ensure_oxipng() {
  if [[ -x "$oxipng" ]]; then return; fi
  mkdir -p "$cache_dir"
  local tarball="$cache_dir/oxipng.tar.gz"
  echo "Fetching oxipng $OXIPNG_VERSION (musl, static)..."
  curl -fsSL "$OXIPNG_URL" -o "$tarball"
  echo "$OXIPNG_SHA256  $tarball" | sha256sum -c -
  tar xzf "$tarball" -C "$cache_dir" --strip-components=1 \
    "oxipng-${OXIPNG_VERSION}-x86_64-unknown-linux-musl/oxipng"
  chmod +x "$oxipng"
}

mode="optimize"
[[ "${1:-}" == "--check" ]] && mode="check"

ensure_oxipng

mapfile -t pngs < <(find "$assets_dir" -type f -name '*.png' | sort)
if [[ ${#pngs[@]} -eq 0 ]]; then
  echo "No PNGs found under $assets_dir"
  exit 0
fi

if [[ "$mode" == "optimize" ]]; then
  "$oxipng" "${OXIPNG_ARGS[@]}" "${pngs[@]}"
  echo "Optimized ${#pngs[@]} PNG(s) in place."
  exit 0
fi

# --check: optimize copies in a temp dir and compare byte-for-byte. Any file that
# shrinks was committed un-optimized, so the check fails and names the offenders.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
offenders=()
for src in "${pngs[@]}"; do
  cp "$src" "$tmp/candidate.png"
  "$oxipng" "${OXIPNG_ARGS[@]}" "$tmp/candidate.png"
  if ! cmp -s "$src" "$tmp/candidate.png"; then
    offenders+=("${src#"$repo_root/"}")
  fi
done

if [[ ${#offenders[@]} -gt 0 ]]; then
  echo "The following PNG(s) are not optimized. Run ./scripts/optimize-png.sh and commit:" >&2
  printf '  %s\n' "${offenders[@]}" >&2
  exit 1
fi
echo "All ${#pngs[@]} PNG(s) already optimized."
