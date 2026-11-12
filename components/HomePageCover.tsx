"use client";

import { ArrowRight, BookOpen, Terminal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "ui";

const tabs = [
  {
    id: "rust",
    label: "Rust",
    file: "workflow.rs",
    tokens: [
      { type: "macro", text: "#[workflow]" },
      { type: "text", text: "\n" },
      { type: "keyword", text: "async fn " },
      { type: "function", text: "process_order" },
      { type: "text", text: "(ctx: " },
      { type: "type", text: "Ctx" },
      { type: "text", text: ", order: " },
      { type: "type", text: "Order" },
      { type: "text", text: ") -> " },
      { type: "type", text: "Result" },
      { type: "text", text: "<()> {\n    " },
      { type: "keyword", text: "let " },
      { type: "text", text: "payment = ctx." },
      { type: "function", text: "execute_task" },
      { type: "text", text: "(charge_payment, order.amount)." },
      { type: "keyword", text: "await" },
      { type: "text", text: "?;\n    ctx." },
      { type: "function", text: "execute_task" },
      { type: "text", text: "(send_receipt, payment.id)." },
      { type: "keyword", text: "await" },
      { type: "text", text: "\n}" },
    ],
  },
  {
    id: "python",
    label: "Python",
    file: "workflow.py",
    tokens: [
      { type: "macro", text: "@workflow" },
      { type: "text", text: "\n" },
      { type: "keyword", text: "async def " },
      { type: "function", text: "process_order" },
      { type: "text", text: "(ctx: " },
      { type: "type", text: "Context" },
      { type: "text", text: ", order: " },
      { type: "type", text: "Order" },
      { type: "text", text: ") -> " },
      { type: "type", text: "None" },
      { type: "text", text: ":\n    payment = " },
      { type: "keyword", text: "await " },
      { type: "text", text: "ctx." },
      { type: "function", text: "execute_task" },
      { type: "text", text: "(charge_payment, order.amount)\n    " },
      { type: "keyword", text: "await " },
      { type: "text", text: "ctx." },
      { type: "function", text: "execute_task" },
      { type: "text", text: "(send_receipt, payment.id)" },
    ],
  },
  {
    id: "typescript",
    label: "TypeScript",
    file: "workflow.ts",
    tokens: [
      { type: "keyword", text: "export const " },
      { type: "text", text: "processOrder = " },
      { type: "function", text: "workflow" },
      { type: "text", text: "({\n  name: " },
      { type: "string", text: "'processOrder'" },
      { type: "text", text: ",\n  run: " },
      { type: "keyword", text: "async " },
      { type: "text", text: "(ctx: " },
      { type: "type", text: "WorkflowContext" },
      { type: "text", text: ", order: " },
      { type: "type", text: "OrderInput" },
      { type: "text", text: ") => {\n    " },
      { type: "keyword", text: "const " },
      { type: "text", text: "payment = " },
      { type: "keyword", text: "await " },
      { type: "text", text: "ctx." },
      { type: "function", text: "executeTask" },
      { type: "text", text: "(chargePayment, order.amount);\n    " },
      { type: "keyword", text: "await " },
      { type: "text", text: "ctx." },
      { type: "function", text: "executeTask" },
      { type: "text", text: "(sendReceipt, payment.chargeId);\n  },\n});" },
    ],
  },
];

const tokenColors: Record<string, string> = {
  keyword: "var(--code-token-keyword)",
  function: "var(--code-token-function)",
  type: "var(--code-token-constant)",
  string: "var(--code-token-string)",
  comment: "var(--code-token-comment)",
  macro: "var(--code-token-keyword)",
  text: "var(--code-foreground)",
};

function HomePageCover() {
  const [activeTab, setActiveTab] = useState("rust");
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="relative w-full">
      {/* Hero */}
      <div className="max-w-7xl px-5 mx-auto pt-12 pb-16 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
        {/* Left: Title + CTAs */}
        <div className="flex flex-col gap-6 lg:w-[45%] shrink-0 lg:pt-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted">
              Open Source
            </span>
            <span className="text-foreground-muted text-xs">·</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted">
              Rust-Native
            </span>
            <span className="text-foreground-muted text-xs">·</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted">
              Multi-Language
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="m-0 text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground leading-[1.15]">
              Workflow orchestration
              <br />
              <span className="text-foreground-lighter">that just works.</span>
            </h1>
            <p className="m-0 text-foreground-light text-sm sm:text-base leading-relaxed">
              Build durable, distributed workflows in Rust, Python, or TypeScript.
              Automatic journaling. Replay protection. Zero YAML.
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
              <ArrowRight
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <Link
              href="/guides/core/understanding"
              className={cn(
                "no-underline",
                "border border-default px-4 py-2 flex gap-2 items-center text-foreground-light text-sm",
                "hover:text-foreground hover:border-foreground-muted transition-colors"
              )}
            >
              <BookOpen size={13} strokeWidth={1.5} />
              Concepts
            </Link>
            <Link
              href="/guides/sdk/cli"
              className={cn(
                "no-underline",
                "border border-default px-4 py-2 flex gap-2 items-center text-foreground-light text-sm",
                "hover:text-foreground hover:border-foreground-muted transition-colors"
              )}
            >
              <Terminal size={13} strokeWidth={1.5} />
              CLI
            </Link>
          </div>
        </div>

        {/* Right: Tabbed code preview */}
        <div className="w-full lg:flex-1 lg:self-start border border-default flex flex-col">
          {/* Tab bar */}
          <div className="flex items-center border-b border-default bg-surface-75">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-2.5 text-sm font-mono transition-colors relative",
                  activeTab === tab.id
                    ? "text-foreground bg-background"
                    : "text-foreground-muted hover:text-foreground-light"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                )}
              </button>
            ))}
            <span className="hidden sm:block ml-auto pl-3 pr-4 text-xs font-mono text-foreground-muted truncate">
              {active.file}
            </span>
          </div>

          {/* Code block */}
          <pre className="p-5 text-[12px] leading-[1.7] font-mono m-0 overflow-x-auto bg-background flex-1">
            <code>
              {active.tokens.map((token, i) => (
                <span key={i} style={{ color: tokenColors[token.type] }}>
                  {token.text}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>

    </div>
  );
}

function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-0 py-8 md:py-0 md:divide-x md:divide-default">
      {[
        { value: "< 2ms", label: "Task dispatch latency" },
        { value: "3", label: "Language SDKs" },
        { value: "100%", label: "Replay determinism" },
        { value: "0", label: "Lines of YAML" },
      ].map((stat, i) => (
        <div
          key={stat.label}
          className={cn("flex flex-col gap-1 md:py-8", i > 0 && "md:pl-8")}
        >
          <div className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
            {stat.value}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HomePageCover;
export { StatsBar };
