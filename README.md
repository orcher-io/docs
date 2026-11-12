<!-- banner -->
<p>
  <img alt="ORCHER Docs" src="./assets/banner.svg#gh-dark-mode-only" width="100%">
  <img alt="ORCHER Docs" src="./assets/banner-light.svg#gh-light-mode-only" width="100%">
</p>
<!-- /banner -->

<p align="center"><sub>The guides for the ORCHER engine and its SDKs, with code that CI compiles.</sub></p>

<br />

<div>
  <a href="https://github.com/orcher-io/docs/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/orcher-io/docs/ci.yml?branch=main&style=flat-square&labelColor=0a0a0a&color=38BDF0&logo=github&logoColor=white&label=CI" alt="CI"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache_2.0-04B385?style=flat-square&labelColor=0a0a0a" alt="Apache 2.0"></a>
</div>

<br />

The source of the ORCHER documentation site: guides for the
[engine](https://github.com/orcher-io/orcher), the Rust, Python and TypeScript
SDKs and the CLI. It is a Next.js app that renders MDX files on the server.

- <img height="14" src="https://octicons-col.vercel.app/book/38BDF0"> **Guides**: MDX files under `content/guides/`, one per page
- <img height="14" src="https://octicons-col.vercel.app/check-circle/38BDF0"> **Checked samples**: code lives in `samples/` as real Rust, Python and TypeScript files that CI compiles against the published SDKs; pages are moved onto them one at a time
- <img height="14" src="https://octicons-col.vercel.app/link/38BDF0"> **Checked links**: a link to a page or heading that does not exist fails the build
- <img height="14" src="https://octicons-col.vercel.app/search/38BDF0"> **Search**: an index built from the guides at build time, with nothing to update by hand

<br />

### <img height="16" src="https://octicons-col.vercel.app/tools/38BDF0"> Develop

Needs Node 22 and pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev            # http://localhost:3001/docs
```

| Command | What it does |
|---|---|
| `pnpm dev` | Build the search index, then run the dev server |
| `pnpm build` | Build the search index, then a production build (type errors fail it) |
| `pnpm start` | Serve a production build |
| `pnpm typecheck` | `tsc --noEmit` over the site and scripts |
| `pnpm check:links` | Fail on any internal link to a missing page or anchor, or to a private orcher-io repository |
| `pnpm check:samples` | Compile the samples against the published SDKs and check CLI commands; see [samples/README.md](samples/README.md) |

<br />

### <img height="16" src="https://octicons-col.vercel.app/pencil/38BDF0"> Writing guides

- A page is `content/guides/<section>/<path>.mdx` (or `<path>/index.mdx`) and is
  served at `/guides/<section>/<path>`. Its sidebar entry lives in
  `components/Navigation/NavigationMenu/NavigationMenu.constants.ts`.
- **Links** are root-relative and leave out the base path:
  `[Retries](/guides/core/tasks/retries#backoff)`, `<Link href="/guides/sdk">`.
  The base path is added once at render time. `pnpm check:links` rejects `/docs/...`
  links, relative links, and links to pages or anchors that don't exist.
- **Code samples**: put the code in `samples/` and include it with
  `<$CodeSample path="rust/quickstart/src/bin/worker.rs" region="workflow" />`
  rather than pasting a fenced block. How, and how to opt a fragment out:
  [samples/README.md](samples/README.md).
- **Images** go in `public/img/` and are referenced as `/img/...`.
- Search is generated from the guides at build time (`scripts/build-search-index.mjs`);
  there is nothing to update by hand.

<br />

### <img height="16" src="https://octicons-col.vercel.app/gear/38BDF0"> Configuration

Both variables are read at build time; see `.env.example`.

| Variable | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `/docs` | Path prefix. Set it to an empty value to serve from the root, e.g. at `docs.orcher.io`. |
| `NEXT_PUBLIC_SITE_URL` | `https://orcher.io` | Public origin, used for canonical URLs and Open Graph tags. |

With a base path, `/` redirects to it.

<br />

### <img height="16" src="https://octicons-col.vercel.app/rocket/38BDF0"> Deploy

The site is a Node server (`next start`), not a static export: pages are
rendered from the MDX on disk. Nothing is deployed from this repository
automatically.

**Docker** (any container host, including a Render Docker service):

```bash
docker build -t orcher-docs .
docker run -p 3000:3000 orcher-docs          # http://localhost:3000/docs

# served from the root of its own host instead:
docker build -t orcher-docs \
  --build-arg NEXT_PUBLIC_BASE_PATH= \
  --build-arg NEXT_PUBLIC_SITE_URL=https://docs.orcher.io .
```

The image runs the standalone server (`node server.js`) as a non-root user and
listens on `$PORT` (default 3000), which Render sets.

**Render Node web service** (no Docker):

| Setting | Value |
|---|---|
| Runtime | Node, version 22 (`NODE_VERSION=22`) |
| Build command | `corepack enable && pnpm install --frozen-lockfile && pnpm build` |
| Start command | `pnpm start -- -p $PORT` |
| Health check path | `/docs` (or `/` with an empty base path) |
| Environment | `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_SITE_URL` as above |

**At orcher.io/docs**: the landing site has to forward `/docs` and `/docs/*`
to this service unchanged (keep the `/docs` prefix; the app expects it).
**At docs.orcher.io**: build with an empty `NEXT_PUBLIC_BASE_PATH` and point the
domain at the service.

<br />

### <img height="16" src="https://octicons-col.vercel.app/checklist/38BDF0"> Continuous integration

`.github/workflows/ci.yml` runs on every pull request: typecheck, production
build, link check and sample check, on GitHub-hosted runners.

<br />

### <img height="16" src="https://octicons-col.vercel.app/heart/38BDF0"> Contributing

Found something wrong or out of date? [Open an issue](https://github.com/orcher-io/docs/issues),
or use "Edit this page" at the foot of any guide to send a fix. For questions
about ORCHER itself, use [Discussions](https://github.com/orcher-io/quickstart/discussions).

<br />

### <img height="16" src="https://octicons-col.vercel.app/law/38BDF0"> License

Licensed under the [Apache License, Version 2.0](LICENSE). The site code is
derived from Supabase's open-source docs; see [NOTICE](NOTICE).
