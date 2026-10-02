import { Progress, Typography } from "antd";

const { Text } = Typography;

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
      <Text type="secondary">{allDone ? "All done! 🎉" : `${done} of ${total} done`}</Text>

      {/* Ant Design's Progress animates on change, shows the % on the right,
          and turns green with a check icon when status="success" */}
      <Progress percent={percent} status={allDone ? "success" : "normal"} aria-label="Todos completed" />
    </div>
  );
}
