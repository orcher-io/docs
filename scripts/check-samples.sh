#!/usr/bin/env bash
# Check the code shown in the guides against the published SDKs and CLI.
#
#   scripts/check-samples.sh            enforce pages in samples/checked-pages.txt,
#                                       count everything else
#   scripts/check-samples.sh --strict   enforce every page under content/guides
#
# Steps (each reports its own status; the run fails if any enforced step fails):
#   fences  scripts/check-fences.mjs: every Rust/TS/Python block comes from
#           samples/ via <$CodeSample> (or is opted out with a reason), and every
#           <$CodeSample> resolves
#   rust    cargo check of the samples/rust workspace (warnings are errors)
#   ts      tsc --noEmit over samples/typescript
#   python  compileall + mypy (strict) over each samples/python/<topic>/
#   cli     every `orcher ...` line in a shell block names a real subcommand
#           and real flags (scripts/check-fences.mjs --cli)
#
# A missing toolchain fails its step. Skip a step only on purpose, with
# SKIP_RUST=1, SKIP_TS=1, SKIP_PYTHON=1 or SKIP_CLI=1.
#
# Environment:
#   CARGO_TARGET_DIR  default samples/rust/target
#   PYTHON            interpreter for the venv (default: first of python3.13,
#                     python3.12, python3.11, python3 that is >= 3.11)
#   SAMPLES_VENV      default samples/python/.venv
#   ORCHER_CLI        CLI command, default `orcher` (e.g. `uvx --from orcher==0.1.1 orcher`)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAMPLES="$ROOT/samples"

STRICT=()
for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=(--strict) ;;
    -h|--help) sed -n '2,/^set -euo/p' "$0" | sed '$d; s/^# \{0,1\}//'; exit 0 ;;
    *) echo "check-samples: unknown argument $arg" >&2; exit 2 ;;
  esac
done

STEPS=()
RESULTS=()
FAILED=0

record() { # name status
  STEPS+=("$1")
  RESULTS+=("$2")
  case "$2" in
    pass|skipped*) ;;
    *) FAILED=1 ;;
  esac
}

# Run a step function; record pass/FAIL(exit) without letting set -e abort.
step() { # name function
  local name="$1" fn="$2" status
  echo
  echo "==> $name"
  # Not `( ... ) || status=$?`: bash ignores set -e anywhere inside a tested
  # command, so a failing command mid-step would not stop the step.
  set +e
  ( set -euo pipefail; "$fn" )
  status=$?
  set -e
  if [ "$status" -eq 0 ]; then
    echo "<== $name: pass"
    record "$name" pass
  else
    echo "<== $name: FAIL (exit $status)"
    record "$name" "FAIL (exit $status)"
  fi
}

skip() { # name reason
  echo
  echo "==> $1: skipped ($2)"
  record "$1" "skipped ($2)"
}

need() { # command step skipvar
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "check-samples: '$1' not found for the $2 step; install it or set $3=1 to skip the step on purpose" >&2
    return 1
  fi
}

# --- fences ----------------------------------------------------------------
fences() {
  node "$ROOT/scripts/check-fences.mjs" ${STRICT[@]+"${STRICT[@]}"}
}

# --- rust ------------------------------------------------------------------
rust() {
  need cargo rust SKIP_RUST
  cargo --version
  export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-$SAMPLES/rust/target}"
  export RUSTFLAGS="${RUSTFLAGS:-} -D warnings"
  cargo check --manifest-path "$SAMPLES/rust/Cargo.toml" --workspace --all-targets --locked
}

# --- typescript --------------------------------------------------------------
typescript() {
  need node typescript SKIP_TS
  need npm typescript SKIP_TS
  local dir="$SAMPLES/typescript"
  if [ ! -d "$dir/node_modules" ]; then
    (cd "$dir" && npm ci --no-audit --no-fund)
  fi
  echo "@orcher/sdk $(node -p "require('$dir/node_modules/@orcher/sdk/package.json').version")"
  "$dir/node_modules/.bin/tsc" --version
  "$dir/node_modules/.bin/tsc" --noEmit -p "$dir"
}

# --- python ----------------------------------------------------------------
find_python() {
  local candidate
  for candidate in ${PYTHON:-} python3.13 python3.12 python3.11 python3; do
    if command -v "$candidate" >/dev/null 2>&1 &&
      "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)' 2>/dev/null; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

python_samples() {
  local python venv dir status=0
  if ! python="$(find_python)"; then
    echo "check-samples: no Python >= 3.11 found (set PYTHON, or SKIP_PYTHON=1 to skip on purpose)" >&2
    return 1
  fi
  venv="${SAMPLES_VENV:-$SAMPLES/python/.venv}"
  if [ ! -x "$venv/bin/python" ]; then
    "$python" -m venv "$venv"
  fi
  # Reinstall only when requirements.txt changed since the last install.
  if ! cmp -s "$SAMPLES/python/requirements.txt" "$venv/.requirements.installed"; then
    "$venv/bin/python" -m pip install --quiet --disable-pip-version-check -r "$SAMPLES/python/requirements.txt"
    cp "$SAMPLES/python/requirements.txt" "$venv/.requirements.installed"
  fi
  "$venv/bin/python" --version
  "$venv/bin/python" -m pip show orcher-sdk | sed -n 's/^Version: /orcher-sdk /p'
  # mypy resolves `from orcher import X` against the installed package only
  # because it ships py.typed; without it the import checks would be hollow.
  "$venv/bin/python" - <<'PY'
import importlib.util, pathlib, sys
spec = importlib.util.find_spec("orcher")
if spec is None or not (pathlib.Path(spec.origin).parent / "py.typed").exists():
    sys.exit("orcher-sdk is not installed with py.typed; mypy cannot check imports from it")
PY
  "$venv/bin/python" -m compileall -q -x '/\.venv/' "$SAMPLES/python"
  # One mypy run per topic directory: each is a little project of its own
  # (worker.py beside tasks.py), and module names repeat across topics.
  for dir in "$SAMPLES"/python/*/; do
    dir="${dir%/}"
    case "$(basename "$dir")" in .venv|__pycache__|.mypy_cache) continue ;; esac
    ls "$dir"/*.py >/dev/null 2>&1 || continue
    echo "mypy python/$(basename "$dir")"
    (cd "$dir" && "$venv/bin/python" -m mypy --config-file "$SAMPLES/python/mypy.ini" \
      --cache-dir "$SAMPLES/python/.mypy_cache" .) || status=1
  done
  return "$status"
}

# --- cli -------------------------------------------------------------------
cli() {
  local command
  read -r -a command <<<"${ORCHER_CLI:-orcher}"
  need "${command[0]}" cli SKIP_CLI
  node "$ROOT/scripts/check-fences.mjs" --cli ${STRICT[@]+"${STRICT[@]}"}
}

need node fences SKIP_NODE || exit 2
step fences fences
if [ "${SKIP_RUST:-}" = 1 ]; then skip rust SKIP_RUST=1; else step rust rust; fi
if [ "${SKIP_TS:-}" = 1 ]; then skip typescript SKIP_TS=1; else step typescript typescript; fi
if [ "${SKIP_PYTHON:-}" = 1 ]; then skip python SKIP_PYTHON=1; else step python python_samples; fi
if [ "${SKIP_CLI:-}" = 1 ]; then skip cli SKIP_CLI=1; else step cli cli; fi

echo
echo "check-samples summary${STRICT[*]:+ (strict)}:"
for i in "${!STEPS[@]}"; do
  printf '  %-11s %s\n' "${STEPS[$i]}" "${RESULTS[$i]}"
done
if [ "$FAILED" -ne 0 ]; then
  echo "check-samples: FAILED"
  exit 1
fi
echo "check-samples: OK"
