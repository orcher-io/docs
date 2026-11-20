// @ts-check

// Where the site is served. Default: https://orcher.io/docs. Set
// NEXT_PUBLIC_BASE_PATH="" to serve from the root (e.g. docs.orcher.io).
// Both are inlined at build time, so set them before `next build`.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/docs";
const staticExport = process.env.NEXT_OUTPUT === "export";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  // The Docker image runs the self-contained server from `.next/standalone`;
  // `next start` (e.g. a Render Node service) uses the regular output.
  // NEXT_OUTPUT=export writes a static site to `out/`, for a static host
  // (e.g. GitHub Pages at docs.orcher.io): every page is listed at build
  // time, so nothing needs a server.
  output: staticExport
    ? "export"
    : process.env.NEXT_OUTPUT === "standalone"
      ? "standalone"
      : undefined,
  // A static host serves `/guides/x/index.html` for `/guides/x/`.
  trailingSlash: staticExport,
  images: {
    dangerouslyAllowSVG: false,
    // There is no image optimizer without a server.
    unoptimized: staticExport,
  },
  // Guides and code samples are read from disk at request time; make sure the
  // standalone server bundle carries them.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./samples/**/*.{rs,ts,py,toml,json}"],
  },
  transpilePackages: ["ui", "ui-patterns", "common", "icons", "next-mdx-remote"],
  // Headers and redirects need a server; a static host sets its own.
  ...(staticExport ? {} : { headers, redirects }),
};

/** Response headers, served by `next start` and the standalone server. */
async function headers() {
  return [
    {
      source: "/:path*",
      headers: [{ key: "X-Frame-Options", value: "DENY" }],
    },
  ];
}

/** With a base path, `/` redirects to it. */
async function redirects() {
  return basePath
    ? [{ source: "/", destination: basePath, basePath: false, permanent: false }]
    : [];
}

export default nextConfig;
