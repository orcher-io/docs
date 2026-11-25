/**
 * One continuous, scrubbable timeline for an animated figure: a list of beats
 * with durations, a play/pause and a replay button, and a track that can be
 * dragged. `render` is a pure function of the beat and the progress through
 * it, so scrubbing backwards works as well as playing.
 */
export interface Beat {
  /** How long the beat lasts, in milliseconds */
  d: number
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export function startTimeline(
  root: HTMLElement,
  beats: Beat[],
  render: (beat: number, progress: number) => void
): () => void {
  const starts: number[] = []
  let total = 0
  for (const b of beats) {
    starts.push(total)
    total += b.d
  }
  const track = root.querySelector<HTMLElement>('.track')!
  const knob = root.querySelector<HTMLElement>('.knob')!
  const clock = root.querySelector<HTMLElement>('.clock')!
  const playButton = root.querySelector<HTMLButtonElement>('.pp')!
  const replayButton = root.querySelector<HTMLButtonElement>('.rp')!
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const seconds = (ms: number) => (ms / 1000).toFixed(1) + 's'

  let t = 0
  let playing = false
  let last = 0
  let raf = 0
  let started = false

  function at(time: number) {
    t = clamp(time, 0, total)
    let k = beats.length - 1
    for (let i = 0; i < beats.length; i++) {
      if (t < starts[i] + beats[i].d) {
        k = i
        break
      }
    }
    render(k, clamp((t - starts[k]) / beats[k].d, 0, 1))
    knob.style.left = (t / total) * 100 + '%'
    clock.textContent = seconds(t) + ' / ' + seconds(total)
  }
  function frame(now: number) {
    if (!playing) return
    t += now - last
    last = now
    if (t >= total) {
      at(total)
      stop()
      return
    }
    at(t)
    raf = requestAnimationFrame(frame)
  }
  function play() {
    if (t >= total) t = 0
    playing = true
    last = performance.now()
    root.classList.add('playing')
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    playing = false
    root.classList.remove('playing')
    cancelAnimationFrame(raf)
  }

  const onPlay = () => (playing ? stop() : play())
  const onReplay = () => {
    at(0)
    play()
  }
  const seek = (e: PointerEvent) => {
    const r = track.getBoundingClientRect()
    at(((e.clientX - r.left) / r.width) * total)
  }
  const onDown = (e: PointerEvent) => {
    stop()
    seek(e)
    track.setPointerCapture(e.pointerId)
    track.addEventListener('pointermove', seek)
  }
  const onUp = () => track.removeEventListener('pointermove', seek)
  const onResize = () => at(t)

  playButton.addEventListener('click', onPlay)
  replayButton.addEventListener('click', onReplay)
  track.addEventListener('pointerdown', onDown)
  track.addEventListener('pointerup', onUp)
  track.addEventListener('pointercancel', onUp)
  window.addEventListener('resize', onResize)

  // Plays once when it scrolls into view, and pauses when it leaves. A reader
  // who asked for reduced motion gets the first frame and the controls.
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !started && !reduced) {
        started = true
        play()
      }
      if (!entry.isIntersecting && playing) stop()
    },
    { threshold: 0.45 }
  )
  observer.observe(root)
  at(0)

  return () => {
    stop()
    observer.disconnect()
    playButton.removeEventListener('click', onPlay)
    replayButton.removeEventListener('click', onReplay)
    track.removeEventListener('pointerdown', onDown)
    track.removeEventListener('pointerup', onUp)
    track.removeEventListener('pointercancel', onUp)
    track.removeEventListener('pointermove', seek)
    window.removeEventListener('resize', onResize)
  }
}
