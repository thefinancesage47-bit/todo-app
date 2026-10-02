/**
 * ProgressBar - shows how many todos are done, e.g. "3 of 8 done" + a bar.
 *
 * Props:
 *   done  - number of completed todos
 *   total - total number of todos (the parent only renders this when total > 0)
 */
export default function ProgressBar({ done, total }) {
  const percent = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <div className="progress">
      <div className="progress-label">
        <span>{allDone ? "All done! 🎉" : `${done} of ${total} done`}</span>
        <span>{percent}%</span>
      </div>

      {/* role="progressbar" + aria-value* let screen readers announce the progress */}
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Todos completed"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* The filled part: its width is the percentage. Turns green at 100%. */}
        <div className={`progress-fill ${allDone ? "complete" : ""}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
