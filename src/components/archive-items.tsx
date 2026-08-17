"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Box,
  ExternalLink,
  FileText,
  Link2,
  Minus,
  MoreHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  formatPrice,
  priceDeltaPercent,
  type ArchiveItem,
} from "@/domain/archive";

export type ViewMode = "list" | "card" | "gallery" | "table";

const accentClass: Record<NonNullable<ArchiveItem["accent"]>, string> = {
  clay: "visual-clay",
  moss: "visual-moss",
  amber: "visual-amber",
  ink: "visual-ink",
  sand: "visual-sand",
};

function ItemTypeIcon({ item }: { item: ArchiveItem }) {
  if (item.type === "product") return <Box aria-hidden className="size-3.5" />;
  if (item.type === "article") {
    return <BookOpen aria-hidden className="size-3.5" />;
  }
  return <Link2 aria-hidden className="size-3.5" />;
}

export function ItemVisual({
  item,
  compact = false,
}: {
  item: ArchiveItem;
  compact?: boolean;
}) {
  const words = item.title.split(/\s+/).filter(Boolean);
  const monogram = `${words[0]?.[0] ?? "A"}${words[1]?.[0] ?? ""}`.toUpperCase();
  return (
    <div
      aria-hidden="true"
      className={`archive-visual ${accentClass[item.accent ?? "sand"]} ${
        compact ? "archive-visual-compact" : ""
      }`}
    >
      <span className="visual-rule" />
      <span className="visual-mark">{monogram}</span>
      <span className="visual-index">{item.id.slice(-3)}</span>
    </div>
  );
}

function TypeLabel({ item }: { item: ArchiveItem }) {
  return (
    <span className="type-label">
      <ItemTypeIcon item={item} />
      {item.type}
    </span>
  );
}

function PriceSummary({ item, compact = false }: { item: ArchiveItem; compact?: boolean }) {
  if (!item.product) return null;
  const delta = priceDeltaPercent(item.product);
  const down = delta !== undefined && delta < 0;

  return (
    <div className={`price-summary ${compact ? "price-summary-compact" : ""}`}>
      <strong>{formatPrice(item.product.currentPriceCents)}</strong>
      {delta !== undefined ? (
        <span className={down ? "delta-down" : delta > 0 ? "delta-up" : "delta-flat"}>
          {down ? <ArrowDownRight aria-hidden /> : delta > 0 ? <ArrowUpRight aria-hidden /> : <Minus aria-hidden />}
          {Math.abs(delta).toFixed(0)}%
        </span>
      ) : null}
    </div>
  );
}

function MetaLine({ item }: { item: ArchiveItem }) {
  return (
    <p className="item-meta">
      <span>{item.site}</span>
      <span aria-hidden>·</span>
      <span>{item.collection}</span>
    </p>
  );
}

function OpenItemButton({
  item,
  onOpen,
  className,
  children,
}: {
  item: ArchiveItem;
  onOpen: (item: ArchiveItem) => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpen(item)}
      aria-label={`Open ${item.title}`}
    >
      {children}
    </button>
  );
}

function ListView({ items, onOpen }: ArchiveItemsProps) {
  return (
    <ul className="archive-list" aria-label="Saved items">
      {items.map((item) => (
        <li key={item.id}>
          <OpenItemButton item={item} onOpen={onOpen} className="list-item">
            <ItemVisual item={item} compact />
            <span className="list-copy">
              <span className="list-heading">
                <TypeLabel item={item} />
                {item.status === "processing" ? (
                  <span className="processing-label">Indexing</span>
                ) : null}
              </span>
              <strong>{item.title}</strong>
              <MetaLine item={item} />
            </span>
            {item.product ? (
              <PriceSummary item={item} compact />
            ) : item.type === "article" ? (
              <span className="progress-copy">{item.readProgress ?? 0}% read</span>
            ) : (
              <ExternalLink aria-hidden className="size-4 item-arrow" />
            )}
          </OpenItemButton>
        </li>
      ))}
    </ul>
  );
}

function CardView({ items, onOpen }: ArchiveItemsProps) {
  return (
    <ul className="card-grid" aria-label="Saved item cards">
      {items.map((item) => (
        <li key={item.id} className="item-card">
          <OpenItemButton item={item} onOpen={onOpen} className="card-button">
            <div className="card-topline">
              <TypeLabel item={item} />
              <MoreHorizontal aria-hidden className="size-4" />
            </div>
            <div className="card-content">
              <strong>{item.title}</strong>
              <p>{item.note}</p>
            </div>
            {item.product ? <PriceSummary item={item} /> : null}
            {item.type === "article" ? (
              <div className="reading-meter" aria-label={`${item.readProgress ?? 0}% read`}>
                <span style={{ width: `${item.readProgress ?? 0}%` }} />
              </div>
            ) : null}
            <MetaLine item={item} />
          </OpenItemButton>
        </li>
      ))}
    </ul>
  );
}

function GalleryView({ items, onOpen }: ArchiveItemsProps) {
  return (
    <ul className="gallery-grid" aria-label="Saved item gallery">
      {items.map((item) => (
        <li key={item.id} className="gallery-item">
          <OpenItemButton item={item} onOpen={onOpen} className="gallery-button">
            <ItemVisual item={item} />
            <span className="gallery-caption">
              <TypeLabel item={item} />
              <strong>{item.title}</strong>
              <span className="gallery-meta">
                {item.site}
                {item.product ? ` · ${formatPrice(item.product.currentPriceCents)}` : ""}
              </span>
            </span>
          </OpenItemButton>
        </li>
      ))}
    </ul>
  );
}

function TableView({ items, onOpen }: ArchiveItemsProps) {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Compact archive table</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Kind</th>
            <th scope="col">Collection</th>
            <th scope="col">Saved</th>
            <th scope="col">Price / progress</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <button type="button" onClick={() => onOpen(item)}>
                  {item.title}
                  <span>{item.site}</span>
                </button>
              </td>
              <td><TypeLabel item={item} /></td>
              <td>{item.collection}</td>
              <td>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(item.savedAt))}</td>
              <td>
                {item.product
                  ? formatPrice(item.product.currentPriceCents)
                  : item.type === "article"
                    ? `${item.readProgress ?? 0}% read`
                    : "Saved"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ArchiveItemsProps {
  items: ArchiveItem[];
  onOpen: (item: ArchiveItem) => void;
}

export function ArchiveItems({
  items,
  view,
  onOpen,
}: ArchiveItemsProps & { view: ViewMode }) {
  if (view === "card") return <CardView items={items} onOpen={onOpen} />;
  if (view === "gallery") return <GalleryView items={items} onOpen={onOpen} />;
  if (view === "table") return <TableView items={items} onOpen={onOpen} />;
  return <ListView items={items} onOpen={onOpen} />;
}

export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div className="sparkline-empty">
        <FileText aria-hidden />
        Price history starts after the next local check.
      </div>
    );
  }

  const width = 320;
  const height = 92;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - 8 - ((value - min) / range) * (height - 20);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Price history: ${values.map((value) => formatPrice(value)).join(", ")}`}
      preserveAspectRatio="none"
    >
      <line x1="0" y1={height - 8} x2={width} y2={height - 8} />
      <polyline points={points} />
      <circle
        cx={width}
        cy={Number(points.split(" ").at(-1)?.split(",")[1] ?? 0)}
        r="4"
      />
    </svg>
  );
}

export function ProductStatus({ item }: { item: ArchiveItem }) {
  const product = item.product;
  if (!product) return null;
  const reached =
    product.currentPriceCents !== undefined &&
    product.targetPriceCents !== undefined &&
    product.currentPriceCents <= product.targetPriceCents;
  return (
    <span className={reached ? "target-reached" : "target-watching"}>
      <Bell aria-hidden />
      {reached ? "Target reached" : product.alertEnabled ? "Watching price" : "Alert paused"}
    </span>
  );
}
