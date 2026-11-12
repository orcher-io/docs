// @ts-check

// Where the site is served. Default: https://orcher.io/docs. Set
// NEXT_PUBLIC_BASE_PATH="" to serve from the root (e.g. docs.orcher.io).
// Both are inlined at build time, so set them before `next build`.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/docs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  // The Docker image runs the self-contained server from `.next/standalone`;
  // `next start` (e.g. a Render Node service) uses the regular output.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  images: {
    dangerouslyAllowSVG: false,
  },
  // Guides and code samples are read from disk at request time; make sure the
  // standalone server bundle carries them.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./samples/**/*.{rs,ts,py,toml,json}"],
  },
  transpilePackages: ["ui", "ui-patterns", "common", "icons", "next-mdx-remote"],
  webpack(config) {
    // content/verified-pages.txt decides what the site publishes; server and
    // client code import it as text (lib/verified-pages.ts).
    config.module.rules.push({ test: /verified-pages\.txt$/, type: "asset/source" });
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
  async redirects() {
    return basePath
      ? [{ source: "/", destination: basePath, basePath: false, permanent: false }]
      : [];
  },
};

export default nextConfig;
