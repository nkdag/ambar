"use client";

// Adapted from BoardUI Free revenue-chart-card.tsx. MIT; see BOARDUI_SOURCE.json.
import { useId, useState, type PointerEvent } from "react";
import { RiArrowRightUpLine } from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { formatPrice, type ArchiveItem } from "@/domain/archive";

const WIDTH = 600;
const HEIGHT = 192;
const LEFT = 52;
const RIGHT = 14;
const TOP = 12;
const BOTTOM = 28;

export function RevenueChartCard({ item, onOpen, className }: {
  item: ArchiveItem;
  onOpen: () => void;
  className?: string;
}) {
  const gradientId = useId();
  const history = item.product?.priceHistoryCents ?? [];
  const [activeIndex, setActiveIndex] = useState(history.length - 1);
  const index = Math.max(0, Math.min(activeIndex, history.length - 1));
  const target = item.product?.targetPriceCents;
  const data = history.map((current, i) => ({ label: i + 1, current, target }));
  const value = history[index];
  const first = history[0];
  const change = first ? Math.round(((value - first) / first) * 100) : 0;
  const minimum = Math.min(...history, target ?? Infinity);
  const maximum = Math.max(...history, target ?? 0);
  const padding = Math.max((maximum - minimum) * 0.35, maximum * 0.08, 100);
  const domainMin = Math.max(0, minimum - padding);
  const domainMax = maximum + padding;
  const plotWidth = WIDTH - LEFT - RIGHT;
  const plotHeight = HEIGHT - TOP - BOTTOM;
  const x = (i: number) => LEFT + (history.length <= 1 ? plotWidth / 2 : (i / (history.length - 1)) * plotWidth);
  const y = (amount: number) => TOP + ((domainMax - amount) / Math.max(1, domainMax - domainMin)) * plotHeight;
  const points = history.map((amount, i) => `${x(i)},${y(amount)}`).join(" ");
  const areaPoints = `${LEFT},${TOP + plotHeight} ${points} ${LEFT + plotWidth},${TOP + plotHeight}`;
  const summary = `${item.title} price history: ${history.length} observations, ${formatPrice(first)} first, ${formatPrice(history.at(-1))} latest${target === undefined ? "" : `, target ${formatPrice(target)}`}. Sequential observations, not dated prices. Full values in View price data.`;

  function selectNearest(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / Math.max(1, rect.width)) * WIDTH;
    const relative = Math.min(1, Math.max(0, (svgX - LEFT) / plotWidth));
    setActiveIndex(Math.round(relative * (history.length - 1)));
  }

  return (
    <div className={cx("price-chart-content", className)}>
      <div className="chart-headline">
        <div>
          <div className="chart-value">
            <strong>{formatPrice(value)}</strong>
            <Chip color={change < 0 ? "lime" : change > 0 ? "rose" : "neutral"}>
              {first === 0 && value !== 0 ? "From $0" : `${change < 0 ? "↓" : change > 0 ? "↑" : "—"} ${Math.abs(change)}%`}
            </Chip>
          </div>
          <p>{index === history.length - 1 ? "Latest observation" : `Observation ${index + 1}`} <span>· {formatPrice(first)} first observation</span></p>
        </div>
        <div className="chart-legend"><span><i className="legend-price" />Price</span>{target !== undefined && <span><i className="legend-target" />Target {formatPrice(target)}</span>}</div>
      </div>
      <div className="price-chart" role="img" aria-label={summary}>
        <svg aria-hidden="true" className="native-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" onPointerMove={selectNearest}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity=".32" />
              <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity=".025" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((step) => {
            const gridY = TOP + (step / 3) * plotHeight;
            const amount = domainMax - (step / 3) * (domainMax - domainMin);
            return <g key={step}><line className="native-chart-grid" x1={LEFT} x2={LEFT + plotWidth} y1={gridY} y2={gridY} /><text className="native-chart-label" x={LEFT - 8} y={gridY + 4} textAnchor="end">{formatPrice(Math.round(amount / 100) * 100)}</text></g>;
          })}
          <polygon points={areaPoints} fill={`url(#${gradientId})`} />
          {target !== undefined && <line className="native-chart-target" x1={LEFT} x2={LEFT + plotWidth} y1={y(target)} y2={y(target)} />}
          <polyline className="native-chart-line" points={points} />
          <line className="native-chart-cursor" x1={x(index)} x2={x(index)} y1={TOP} y2={TOP + plotHeight} />
          <circle className="native-chart-dot" cx={x(index)} cy={y(value)} r="5" />
          <text className="native-chart-label" x={LEFT} y={HEIGHT - 5}>1</text>
          <text className="native-chart-label" x={LEFT + plotWidth} y={HEIGHT - 5} textAnchor="end">{history.length}</text>
        </svg>
      </div>
      <div className="observation-control">
        <input type="range" aria-label="Price observation" min={0} max={history.length - 1} value={index} onChange={(event) => setActiveIndex(Number(event.target.value))} />
        <output role="status" aria-label="Selected price observation">Observation {index + 1} of {history.length}: {formatPrice(value)}</output>
      </div>
      <div className="chart-foot">
        <details className="chart-data"><summary>View price data</summary><table><caption>Price history observations</caption><thead><tr><th scope="col">Observation</th><th scope="col">Price</th><th scope="col">Target</th></tr></thead><tbody>{data.map((point) => <tr key={point.label}><th scope="row">{point.label}</th><td>{formatPrice(point.current)}</td><td>{target === undefined ? "Not set" : formatPrice(target)}</td></tr>)}</tbody></table></details>
        <Button variant="ghost" trailingIcon={RiArrowRightUpLine} aria-label="Open watched product" onClick={onOpen}>View item</Button>
      </div>
    </div>
  );
}
