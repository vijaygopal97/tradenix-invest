#!/usr/bin/env bash
# Sync local changes to GitHub (tradenix-invest).
# Usage:
#   ./scripts/push-to-github.sh
#   ./scripts/push-to-github.sh "Fix withdrawal validation"
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PAT_FILE="${GITHUB_PAT_FILE:-$ROOT/git-pat.txt}"
REMOTE="${GITHUB_REMOTE:-origin}"
BRANCH="${GITHUB_BRANCH:-main}"
REPO_NAME="${GITHUB_REPO:-tradenix-invest}"

if [[ ! -f "$PAT_FILE" ]]; then
  echo "error: PAT file not found at $PAT_FILE" >&2
  echo "Create git-pat.txt with a GitHub personal access token (repo scope)." >&2
  exit 1
fi

TOKEN="$(tr -d '[:space:]' <"$PAT_FILE")"
if [[ -z "$TOKEN" ]]; then
  echo "error: PAT file is empty" >&2
  exit 1
fi

GITHUB_USER="$(
  curl -fsS -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user | sed -n 's/.*"login"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1
)"
if [[ -z "$GITHUB_USER" ]]; then
  echo "error: could not resolve GitHub user (check PAT permissions)" >&2
  exit 1
fi

PUSH_URL="https://x-access-token:${TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

if ! git remote get-url "$REMOTE" &>/dev/null; then
  git remote add "$REMOTE" "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

git add -A

if git diff --staged --quiet; then
  echo "Nothing to commit — working tree matches the last commit."
else
  MSG="${1:-Update $(date -u +%Y-%m-%dT%H:%M:%SZ)}"
  git commit -m "$MSG"
  echo "Committed: $MSG"
fi

git push "$PUSH_URL" "HEAD:${BRANCH}"
echo "Pushed to https://github.com/${GITHUB_USER}/${REPO_NAME} (${BRANCH})"
