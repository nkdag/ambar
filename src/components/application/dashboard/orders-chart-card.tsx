"use client";

// Adapted from BoardUI Free orders-chart-card.tsx. MIT; see BOARDUI_SOURCE.json.
import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "@/components/base/segmented-control/segmented-control";
import { archiveActivity } from "@/components/application/overview-data";
import type { ArchiveItem } from "@/domain/archive";

const WIDTH = 300;
const HEIGHT = 170;
const LEFT = 24;
const RIGHT = 8;
const TOP = 10;
const BOTTOM = 28;

export function OrdersChartCard({ items }: { items: ArchiveItem[] }) {
  const [days, setDays] = useState(14);
  const data = archiveActivity(items, days);
  const total = data.reduce((sum, point) => sum + point.current, 0);
  const range = data.length ? `${data[0].label} – ${data.at(-1)!.label}, ${data.at(-1)!.date.slice(0, 4)} (UTC)` : "No saves yet";
  const plotWidth = WIDTH - LEFT - RIGHT;
  const plotHeight = HEIGHT - TOP - BOTTOM;
  const max = Math.max(2, ...data.map((point) => point.current));
  const gap = 3;
  const barWidth = Math.max(2, plotWidth / Math.max(1, data.length) - gap);
  const tickIndexes = new Set([0, Math.floor(data.length / 2), data.length - 1]);

  return (
    <section className="overview-panel activity-panel" aria-label="Archive activity">
      <div className="panel-heading">
        <h2>Archive activity</h2>
        <SegmentedControl aria-label="Activity range" selectedKeys={new Set([String(days)])} onSelectionChange={(keys) => setDays(Number([...keys][0]))}>
          <SegmentedControlItem id="7" aria-label="7 days">7d</SegmentedControlItem>
          <SegmentedControlItem id="14" aria-label="14 days">14d</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div className="activity-value"><strong>{total}</strong>{" "}<span>{total === 1 ? "save" : "saves"}</span></div>
      <p className="activity-range">{range}</p>
      <div className="activity-chart" role="img" aria-label={`Archive activity: ${total} saves over ${days} days. ${data.map((point) => `${point.label}: ${point.current}`).join("; ")}`}>
        <svg aria-hidden="true" className="native-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
          {[0, 1, 2].map((step) => {
            const gridY = TOP + (step / 2) * plotHeight;
            return <g key={step}><line className="native-chart-grid" x1={LEFT} x2={LEFT + plotWidth} y1={gridY} y2={gridY} /><text className="native-chart-label" x={LEFT - 6} y={gridY + 4} textAnchor="end">{Math.round(max - (step / 2) * max)}</text></g>;
          })}
          {data.map((point, index) => {
            const height = (point.current / max) * plotHeight;
            const x = LEFT + index * (plotWidth / Math.max(1, data.length)) + gap / 2;
            const y = TOP + plotHeight - height;
            return <g key={point.date}><rect className="native-chart-bar" x={x} y={y} width={barWidth} height={Math.max(point.current ? 2 : 0, height)} rx="3" />{tickIndexes.has(index) && <text className="native-chart-label" x={x + barWidth / 2} y={HEIGHT - 5} textAnchor="middle">{point.label}</text>}</g>;
          })}
        </svg>
      </div>
      <div className="chart-foot">
        <details className="chart-data"><summary>View activity data</summary><table><caption>Archive saves by UTC date</caption><thead><tr><th scope="col">Date</th><th scope="col">Saves</th></tr></thead><tbody>{data.map((point) => <tr key={point.date}><th scope="row">{point.date}</th><td>{point.current}</td></tr>)}</tbody></table></details>
        <span className="activity-note">Ending at latest save</span>
      </div>
    </section>
  );
}
