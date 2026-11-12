"use client";

import { ArrowRight, ArrowUpRight, BookOpen, Terminal } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cn } from "ui";

/** One language's tab: `code` is the highlighted block, rendered on the server. */
export type HeroTab = {
  id: string;
  label: string;
  file: string;
  code: ReactNode;
};

const ENGINE_REPO_URL = "https://github.com/orcher-io/orcher";

const secondaryButton = cn(
  "no-underline",
  "border border-default px-4 py-2 flex gap-2 items-center text-foreground-light text-sm",
  "hover:text-foreground hover:border-foreground-muted transition-colors"
);

function HomePageCover({ tabs }: { tabs: HeroTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="relative w-full">
      <div className="max-w-7xl px-5 mx-auto pt-12 pb-16 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
        {/* Left: title and calls to action */}
        <div className="flex flex-col gap-6 lg:w-[45%] shrink-0 lg:pt-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-foreground-lighter">
            <span>Open source</span>
            <span aria-hidden="true">·</span>
            <span>Apache-2.0</span>
            <span aria-hidden="true">·</span>
            <span>Rust, Python, TypeScript</span>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="m-0 text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground leading-[1.15]">
              Workflows that
              <br />
              <span className="text-foreground-lighter">survive crashes.</span>
            </h1>
            <p className="m-0 text-foreground-light text-sm sm:text-base leading-relaxed">
              Write a workflow as ordinary async code in Rust, Python or TypeScript. Orcher
              journals every step, so after a crash or a deploy a run resumes from its last
              completed step.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/guides/getting-started/quickstart"
              className={cn(
                "group no-underline",
                "bg-foreground text-background px-4 py-2 flex gap-2 items-center text-sm font-medium",
                "hover:opacity-90 transition-opacity"
              )}
            >
              Get Started
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/guides/core/understanding" className={secondaryButton}>
              <BookOpen size={13} strokeWidth={1.5} />
              Concepts
            </Link>
            <Link href="/guides/sdk/cli" className={secondaryButton}>
              <Terminal size={13} strokeWidth={1.5} />
              CLI
            </Link>
            <a
              href={ENGINE_REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className={secondaryButton}
            >
              GitHub
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Right: the quickstart's workflow, in each language */}
        <div className="w-full min-w-0 lg:flex-1 lg:self-start border border-default flex flex-col">
          <div className="flex items-center border-b border-default bg-surface-75" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active?.id === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 sm:px-5 py-2.5 text-sm font-mono transition-colors relative",
                  active?.id === tab.id
                    ? "text-foreground bg-background"
                    : "text-foreground-lighter hover:text-foreground-light"
                )}
              >
                {tab.label}
                {active?.id === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                )}
              </button>
            ))}
            <span className="hidden sm:block ml-auto pl-3 pr-4 text-xs font-mono text-foreground-lighter truncate">
              {active?.file}
            </span>
          </div>

          <div className="relative">
            {tabs.map((tab) => (
              <div key={tab.id} role="tabpanel" hidden={active?.id !== tab.id}>
                {tab.code}
              </div>
            ))}
            {/* On a narrow screen the code scrolls sideways; fade its edge to say so. */}
            <div
              aria-hidden="true"
              className="sm:hidden pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-0 py-8 md:py-0 md:divide-x md:divide-default">
      {[
        { value: "3", label: "SDKs: Rust, Python, TypeScript" },
        { value: "PostgreSQL", label: "The only service it needs" },
        { value: "Apache-2.0", label: "Engine, SDKs and CLI" },
        { value: "0", label: "Lines of YAML" },
      ].map((stat, i) => (
        <div
          key={stat.label}
          className={cn("flex flex-col gap-1 md:py-8", i > 0 && "md:pl-8")}
        >
          <div className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
            {stat.value}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-foreground-lighter">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HomePageCover;
export { StatsBar };
