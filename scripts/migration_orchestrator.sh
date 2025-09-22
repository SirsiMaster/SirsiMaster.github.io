#!/usr/bin/env bash
set -euo pipefail

# Migration Orchestrator: Unify SirsiMaster.github.io and SirsiNexusApp
# Phases are restartable and idempotent where possible.
# Usage:
#   scripts/migration_orchestrator.sh --phase <name> [--resume] [--dry-run] [--yes]
#   scripts/migration_orchestrator.sh --list
#
# Phases:
#   preflight, backup, add_remote, fetch_remote, subtree_add, move_paths,
#   reconcile_tooling, ci_updates, gh_pages_check, verify, finalize, backout
#
# State is tracked at .migration_state. Logs at logs/migration.log

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [[ -z "${ROOT_DIR}" ]]; then
  echo "Error: Must run inside a git repository." >&2
  exit 1
fi
cd "$ROOT_DIR"

STATE_FILE=".migration_state"
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/migration.log"
mkdir -p "$LOG_DIR"

PHASES=(
  preflight
  backup
  add_remote
  fetch_remote
  subtree_add
  move_paths
  reconcile_tooling
  ci_updates
  gh_pages_check
  verify
  finalize
  backout
)

PHASE=""
RESUME=false
DRY_RUN=false
ASSUME_YES=false

say() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
run() {
  if $DRY_RUN; then
    say "DRY-RUN: $*"
  else
    say "+ $*"
    eval "$@" 2>&1 | tee -a "$LOG_FILE"
  fi
}

list_phases() {
  printf "%s\n" "${PHASES[@]}"
}

save_state() {
  echo "$1" > "$STATE_FILE"
}

read_state() {
  [[ -f "$STATE_FILE" ]] && cat "$STATE_FILE" || true
}

confirm() {
  if $ASSUME_YES; then return 0; fi
  read -r -p "$1 [y/N]: " ans
  [[ "${ans:-}" == "y" || "${ans:-}" == "Y" ]]
}

phase_index() {
  local target="$1"
  for i in "${!PHASES[@]}"; do
    if [[ "${PHASES[$i]}" == "$target" ]]; then
      echo "$i"; return 0
    fi
  done
  echo "-1"
}

next_phase_after() {
  local current="$1"
  local idx
  idx=$(phase_index "$current")
  [[ "$idx" -ge 0 ]] || { echo ""; return; }
  idx=$((idx+1))
  if [[ "$idx" -lt "${#PHASES[@]}" ]]; then
    echo "${PHASES[$idx]}"
  else
    echo ""
  fi
}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --phase) PHASE="$2"; shift 2 ;;
    --resume) RESUME=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --yes|-y) ASSUME_YES=true; shift ;;
    --list) list_phases; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$PHASE" && "$RESUME" = false ]]; then
  echo "Specify --phase <name> or --resume. Use --list to see phases." >&2
  exit 1
fi

if $RESUME; then
  PHASE=$(read_state)
  if [[ -z "$PHASE" ]]; then
    echo "No saved state to resume." >&2
    exit 1
  fi
  say "Resuming from saved phase: $PHASE"
fi

run_phase() {
  local p="$1"
  say "=== Phase: $p ==="
  case "$p" in
    preflight)
      run "git --no-pager status -sb"
      run "git --no-pager remote -v"
      run "xcodebuild -version || true"
      ;;
    backup)
      mkdir -p backups
      TS=$(date +%Y%m%d_%H%M%S)
      run "tar -czf backups/repo-backup-${TS}.tar.gz . --exclude=backups --exclude=.git"
      ;;
    add_remote)
      # Safe add remote if missing
      if git remote get-url sirsiapp >/dev/null 2>&1; then
        say "Remote 'sirsiapp' already exists"
      else
        confirm "Add remote 'sirsiapp' (git@github.com:SirsiMaster/SirsiNexusApp.git)?" || { say "Skipped add_remote"; return; }
        run "git remote add sirsiapp git@github.com:SirsiMaster/SirsiNexusApp.git"
      fi
      ;;
    fetch_remote)
      run "git fetch sirsiapp --tags --prune"
      ;;
    subtree_add)
      # Idempotent add: if apps/core exists, attempt subtree pull instead
      if [[ -d apps/core ]]; then
        say "apps/core exists; attempting subtree pull"
        run "git subtree pull --prefix=apps/core sirsiapp main --squash"
      else
        run "git subtree add --prefix=apps/core sirsiapp main --squash"
      fi
      ;;
    move_paths)
      mkdir -p apps/portal
      # Move known top-level files conservatively
      if [[ -d sirsinexusportal ]]; then run "git mv -k sirsinexusportal apps/portal/sirsinexusportal"; fi
      if [[ -f index.html ]]; then run "git mv -k index.html apps/portal/index.html"; fi
      # No-op if already moved
      ;;
    reconcile_tooling)
      say "Resolve conflicts, align Node versions, and update scripts as needed. Manual review may be required."
      run "git --no-pager status -sb"
      ;;
    ci_updates)
      say "Update CI/CD to point to apps/portal for GH Pages and consolidate workflows."
      ;;
    gh_pages_check)
      say "Verify Pages build locally and validate site health script."
      if [[ -x ./validate-site.sh ]]; then run "./validate-site.sh"; else say "validate-site.sh not found, skipping"; fi
      ;;
    verify)
      say "Run smoke tests and basic validation."
      ;;
    finalize)
      say "Finalize: create PR/branch tags as needed."
      ;;
    backout)
      say "Backout procedure: restore from backup tarball or reset to pre-migration tag. Manual steps required."
      ;;
    *)
      echo "Unknown phase: $p" >&2; exit 1 ;;
  esac
}

# Execute from chosen phase to end
start_idx=$(phase_index "$PHASE")
if [[ "$start_idx" -lt 0 ]]; then
  echo "Invalid phase: $PHASE" >&2
  exit 1
fi

for (( i=start_idx; i<${#PHASES[@]}; i++ )); do
  current="${PHASES[$i]}"
  save_state "$current"
  run_phase "$current"
  say "Completed phase: $current"
  next=$(next_phase_after "$current")
  if [[ -n "$next" ]]; then
    say "Next phase: $next (resume using: scripts/migration_orchestrator.sh --resume)"
  fi
done

say "All requested phases complete."
