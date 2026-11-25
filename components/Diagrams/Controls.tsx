/** The play/pause and replay buttons, and the clock, above a figure's timeline. */
export function Controls({ label }: { label: string }) {
  return (
    <div className="tlh">
      <button className="ic pp" type="button" aria-label="Play or pause">
        <svg className="play" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 1l9 5-9 5z" />
        </svg>
        <svg className="pause" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 1h3v10H2zM7 1h3v10H7z" />
        </svg>
      </button>
      <button className="ic rp" type="button" aria-label="Replay from the start">
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 1a5 5 0 1 0 5 5H9.5A3.5 3.5 0 1 1 6 2.5V5l3.5-3L6-1z" transform="translate(0 1)" />
        </svg>
      </button>
      <span className="label">{label}</span>
      <span className="clock" />
    </div>
  )
}
