# ORCHER documentation

The source of the ORCHER docs site, served at [orcher.io/docs](https://orcher.io/docs).
It is a Next.js app: guides are MDX files under `content/guides/`, rendered on the
server, and every Rust, TypeScript and Python sample is a real file under
`samples/` that is compiled against the published SDKs.

## Develop

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
| `pnpm check:samples` | Compile every sample against the published SDKs and check CLI commands; see [samples/README.md](samples/README.md) |

## Writing guides

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

## Configuration

Both variables are read at build time; see `.env.example`.

| Variable | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `/docs` | Path prefix. Set it to an empty value to serve from the root, e.g. at `docs.orcher.io`. |
| `NEXT_PUBLIC_SITE_URL` | `https://orcher.io` | Public origin, used for canonical URLs and Open Graph tags. |

With a base path, `/` redirects to it.

## Deploy

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

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request: typecheck, production
build, link check and sample check, on GitHub-hosted runners.

## Licence

Apache-2.0; see [LICENSE](LICENSE). The site code is derived from Supabase's
open-source docs; see [NOTICE](NOTICE).
