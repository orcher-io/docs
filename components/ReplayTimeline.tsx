'use client'

import { useEffect, useRef, useState } from 'react'

interface Step {
  step: number
  task: string
  action?: string
  result?: string
  status: 'executed' | 'crashed' | 'cached' | 'fresh'
}

interface ReplayTimelineProps {
  title?: string
  firstRunSteps: Step[]
  replaySteps: Step[]
}

function ReplayTimeline({
  title = 'Payment Workflow',
  firstRunSteps,
  replaySteps,
}: ReplayTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const totalItems = firstRunSteps.length + replaySteps.length + 2 // +2 for headers

  useEffect(() => {
    if (hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let count = 0
          const interval = setInterval(() => {
            count++
            setVisibleCount(count)
            if (count >= totalItems) clearInterval(interval)
          }, 300)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasAnimated, totalItems])

  // Map items to a flat index
  let idx = 0
  const firstHeaderIdx = idx++
  const firstStepIndices = firstRunSteps.map(() => idx++)
  const replayHeaderIdx = idx++
  const replayStepIndices = replaySteps.map(() => idx++)

  return (
    <div ref={ref} className="not-prose my-8 max-w-lg mx-auto border overflow-hidden">
      {/* First run header */}
      <div
        className="bg-surface-75 px-4 py-2 border-b flex items-center justify-between transition-all duration-500"
        style={{
          opacity: visibleCount > firstHeaderIdx ? 1 : 0,
          transform: visibleCount > firstHeaderIdx ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <span className="text-xs font-medium text-foreground">First Execution</span>
        <span className="text-[10px] font-mono text-foreground-muted">{title}</span>
      </div>

      {/* First run steps */}
      {firstRunSteps.map((s, i) => (
        <div
          key={`first-${s.step}`}
          className="transition-all duration-500"
          style={{
            opacity: visibleCount > firstStepIndices[i] ? 1 : 0,
            transform: visibleCount > firstStepIndices[i] ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {s.status === 'crashed' ? (
            <div className="px-4 py-2 border-b bg-red-500/5 flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center border border-red-400/30 bg-background text-[10px] font-mono text-red-400 shrink-0">
                {s.step}
              </span>
              <code className="text-xs text-foreground flex-1">{s.task}</code>
              <span className="text-[10px] font-mono text-red-400">
                CRASH {s.action || 'before execution'}
              </span>
              <span className="text-[10px] text-red-400">✗</span>
            </div>
          ) : (
            <div className="px-4 py-2 border-b flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center border bg-background text-[10px] font-mono text-foreground-muted shrink-0">
                {s.step}
              </span>
              <code className="text-xs text-foreground flex-1">{s.task}</code>
              {s.action && (
                <span className="text-[10px] text-foreground-muted">{s.action}</span>
              )}
              {s.result && (
                <span className="text-[10px] font-mono text-foreground-muted">→ {s.result}</span>
              )}
              <span className="text-[10px] text-foreground-muted">✓</span>
            </div>
          )}
        </div>
      ))}

      {/* Replay header */}
      <div
        className="bg-surface-75 px-4 py-2 border-b flex items-center justify-between transition-all duration-500"
        style={{
          opacity: visibleCount > replayHeaderIdx ? 1 : 0,
          transform: visibleCount > replayHeaderIdx ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <span className="text-xs font-medium text-foreground">Replay</span>
        <span className="text-[10px] font-mono text-foreground-muted">New worker picks up</span>
      </div>

      {/* Replay steps */}
      {replaySteps.map((s, i) => {
        const isLast = i === replaySteps.length - 1
        return (
          <div
            key={`replay-${s.step}`}
            className="transition-all duration-500"
            style={{
              opacity: visibleCount > replayStepIndices[i] ? 1 : 0,
              transform: visibleCount > replayStepIndices[i] ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <div
              className={`px-4 py-2 ${isLast ? '' : 'border-b'} flex items-center gap-3 ${s.status === 'cached' ? 'opacity-60' : ''}`}
            >
              <span className="w-5 h-5 flex items-center justify-center border bg-background text-[10px] font-mono text-foreground-muted shrink-0">
                {s.step}
              </span>
              <code className="text-xs text-foreground flex-1">{s.task}</code>
              <span className="text-[10px] font-mono text-foreground-muted">
                {s.status === 'cached' ? (
                  <span className="italic">cached{s.result ? ` → ${s.result}` : ''}</span>
                ) : (
                  'Execute fresh'
                )}
              </span>
              <span className="text-[10px] text-foreground-muted">
                {s.status === 'cached' ? '↺' : '✓'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ReplayTimeline
