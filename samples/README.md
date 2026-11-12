# Code samples

Every Rust, TypeScript and Python sample shown in the guides lives here as a
real source file and is compiled against the **published** SDKs by
`scripts/check-samples.sh`:

| Language   | Package checked against                  | How                                   |
|------------|------------------------------------------|---------------------------------------|
| Rust       | `orcher-sdk` 0.7 (crates.io)             | `cargo check` of the `rust/` workspace, warnings are errors |
| TypeScript | `@orcher/sdk` 0.5 (npm)                  | `tsc --noEmit` over `typescript/`     |
| Python     | `orcher-sdk` 0.4 (PyPI)                  | `compileall` + `mypy --strict` per `python/<topic>/` |
| CLI        | `orcher` (the CLI on `PATH`, or `$ORCHER_CLI`) | every `orcher ...` line in a shell block must be a real subcommand with real flags |

## Adding a sample to a page

1. **Write the code** in the language's project:
   - Rust: a member crate of the `rust/` workspace, one per page or topic
     (`rust/<topic>/Cargo.toml` taking `orcher-sdk.workspace = true`; add it to
     `members` in `rust/Cargo.toml`). Binaries go in `src/main.rs` or
     `src/bin/<name>.rs`.
   - TypeScript: `typescript/src/<topic>/<file>.ts`. Every file is a module, so
     names don't clash across topics.
   - Python: `python/<topic>/<file>.py`. Each topic directory is type-checked on
     its own, so files in it import each other by plain module name
     (`from tasks import charge`), as in a user's project.

   Write it as complete code that would run. Stub out the outside world with a
   comment (`// Call your payment provider here.`) rather than calling a
   made-up client library.

2. **Mark the part the page shows** with region comments, if not the whole
   file. Marker lines are dropped and the region is de-indented:

   ```rust
   // [start:workflow]
   #[workflow(name = "order")]
   async fn order(ctx: WorkflowContext, order_id: String) -> Result<String> { ... }
   // [end:workflow]
   ```

   Use the language's own comment (`//` or `#`). A region can be opened and
   closed several times to stitch non-adjacent lines together (e.g. the
   imports plus a function), and regions may nest or overlap.

3. **Include it in the MDX** with a directive on a line of its own, with blank
   lines around it as for a fence (it works inside `<TabPanel>`):

   ```mdx
   <$CodeSample path="rust/quickstart/src/bin/worker.rs" region="workflow" />
   ```

   `path` is relative to `samples/`. Optional: `region`, `lang` (overrides the
   language guessed from the extension), `title` (passed through as the
   fence's meta string). The directive becomes an ordinary fenced block before
   MDX compiles, and a missing file or region fails the site build.

4. **Run the check**: `scripts/check-samples.sh`.

5. When a page has no hand-typed Rust/TS/Python fences left, **add it to
   `checked-pages.txt`** (see below).

## Fences that should not compile

Some blocks are deliberately not compilable: a sketch of a wrong approach, a
compile error on purpose, pseudo-code. Opt such a block out with a comment on
the line above it (blank lines between are fine). The reason is required:

````mdx
{/* sample-check: skip — shows the error you get without a TaskContext */}

```rust
#[task]
async fn charge(order_id: String) -> Result<String> { ... }
```
````

Shell, TOML, YAML and other fences are not compiled and need nothing. Shell
blocks are still read for `orcher ...` commands.

## `checked-pages.txt`: turning enforcement on page by page

Most guide pages still have hand-typed samples, so the check runs in two
modes:

- **Pages listed in `checked-pages.txt`** are enforced: any Rust/TS/Python
  fence not taken from `samples/` (and not opted out with a reason), or any
  `orcher ...` command the CLI rejects, fails the run.
- **Every other page** is counted and reported only.

A broken `<$CodeSample>` (missing file or region) fails on every page.

Add a page to the list in the change that converts it. When every page under
`content/guides` is listed, CI switches to `scripts/check-samples.sh --strict`,
which enforces every page, and the list can be deleted.

`node scripts/check-fences.mjs --verbose` (or `--cli --verbose`) lists every
unchecked fence or CLI mismatch on the report-only pages.

## Running the check locally

```bash
scripts/check-samples.sh            # what CI runs
scripts/check-samples.sh --strict   # as if every page were in checked-pages.txt
```

It needs, on `PATH`: Node 22+ and npm, `cargo` (stable Rust; with rustup it may
live under `~/.rustup/toolchains/stable-<host>/bin` if `~/.cargo/bin` is not on
`PATH`), Python 3.11+ (or set `PYTHON`), and the `orcher` CLI (or set
`ORCHER_CLI`, e.g. `ORCHER_CLI="uvx --from orcher==0.1.1 orcher"`). A missing
toolchain fails its step; skip a step on purpose with `SKIP_RUST=1`,
`SKIP_TS=1`, `SKIP_PYTHON=1` or `SKIP_CLI=1`.

Build output stays here and is git-ignored: `rust/target/`,
`typescript/node_modules/`, `python/.venv/`. Delete them to reclaim disk
space; the Rust target is the big one. `rust/Cargo.lock` and
`typescript/package-lock.json` are committed so the check is reproducible;
bump the SDK versions deliberately (`cargo update -p orcher-sdk`,
`npm install @orcher/sdk@latest`, `requirements.txt`).

`typescript/` is an npm project, not part of the site's pnpm workspace, and
its `.npmrc` pins the `@orcher` scope to the public npm registry so the check
never picks up a private build.
