#!/usr/bin/env bash
# Fails if /.kiro is missing or excluded from git. The hackathon rules disqualify
# submissions that gitignore the .kiro directory.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [ ! -d .kiro ]; then
  echo "ERROR: .kiro directory is missing from the repository root." >&2
  exit 1
fi

if grep -Eq '^\s*/?\.kiro(/|\*)?\s*$' .gitignore 2>/dev/null; then
  echo "ERROR: .gitignore excludes .kiro. Remove that entry." >&2
  exit 1
fi

# Catches ignore rules from any source (nested .gitignore, global excludes, etc.).
if git check-ignore -q .kiro/steering/product.md; then
  echo "ERROR: git is ignoring files under .kiro." >&2
  exit 1
fi

echo "OK: .kiro is present and tracked-friendly."
