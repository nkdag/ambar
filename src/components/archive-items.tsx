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

function formatSavedDate(savedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(savedAt));
}

function DeltaBadge({ delta }: { delta: number }) {
  const down = delta < 0;
  const direction = down ? "down" : delta > 0 ? "up" : "unchanged";
  return (
    <span
      className={`delta-badge ${down ? "delta-down" : delta > 0 ? "delta-up" : "delta-flat"}`}
    >
      {down ? (
        <ArrowDownRight aria-hidden />
      ) : delta > 0 ? (
        <ArrowUpRight aria-hidden />
      ) : (
        <Minus aria-hidden />
      )}
      <span className="delta-direction">{direction}</span>
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}

function PriceSummary({ item, compact = false }: { item: ArchiveItem; compact?: boolean }) {
  if (!item.product) return null;
  const delta = priceDeltaPercent(item.product);

  return (
    <div className={`price-summary ${compact ? "price-summary-compact" : ""}`}>
      <span className="price-now">
        <strong>{formatPrice(item.product.currentPriceCents)}</strong>
        {item.product.previousPriceCents !== undefined ? (
          <span className="price-was">
            was {formatPrice(item.product.previousPriceCents)}
          </span>
        ) : null}
      </span>
      {delta !== undefined ? <DeltaBadge delta={delta} /> : null}
    </div>
  );
}

function MetaLine({ item }: { item: ArchiveItem }) {
  return (
    <p className="item-meta">
      <span>{item.site}</span>
      <span aria-hidden>·</span>
      <span>{item.collection}</span>
      <span aria-hidden>·</span>
      <span>Saved {formatSavedDate(item.savedAt)}</span>
    </p>
  );
}

function productStatusLabel(item: ArchiveItem) {
  const product = item.product;
  if (!product || product.targetPriceCents === undefined) return null;
  const reached =
    product.currentPriceCents !== undefined &&
    product.currentPriceCents <= product.targetPriceCents;
  if (reached) return "Target reached";
  return product.alertEnabled ? "Watching price" : "Alert paused";
}

function itemAccessibleLabel(item: ArchiveItem) {
  const parts = [`Open ${item.title}`, item.type, item.site, item.collection];
  if (item.product) {
    const delta = priceDeltaPercent(item.product);
    parts.push(`current price ${formatPrice(item.product.currentPriceCents)}`);
    if (item.product.previousPriceCents !== undefined) {
      parts.push(`was ${formatPrice(item.product.previousPriceCents)}`);
    }
    if (delta !== undefined) {
      const direction = delta < 0 ? "down" : delta > 0 ? "up" : "unchanged";
      parts.push(`${direction} ${Math.abs(delta).toFixed(0)} percent`);
    }
    const status = productStatusLabel(item);
    if (status) parts.push(status.toLocaleLowerCase("en-US"));
  } else if (item.type === "article") {
    parts.push(`${item.readProgress ?? 0} percent read`);
  }
  if (item.status === "processing") parts.push("indexing");
  parts.push(`saved ${formatSavedDate(item.savedAt)}`);
  return parts.join(", ");
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
      aria-label={itemAccessibleLabel(item)}
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
            {item.product ? (
              <>
                <PriceSummary item={item} />
                <ProductStatus item={item} />
              </>
            ) : null}
            {item.type === "article" ? (
              <div className="reading-row">
                <div className="reading-meter" aria-hidden="true">
                  <span style={{ width: `${item.readProgress ?? 0}%` }} />
                </div>
                <span className="progress-copy">{item.readProgress ?? 0}% read</span>
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
      {items.map((item) => {
        const delta = item.product ? priceDeltaPercent(item.product) : undefined;
        return (
          <li key={item.id} className="gallery-item">
            <OpenItemButton item={item} onOpen={onOpen} className="gallery-button">
              <ItemVisual item={item} />
              <span className="gallery-caption">
                <TypeLabel item={item} />
                <strong>{item.title}</strong>
                <span className="gallery-meta">
                  {item.site}
                  {item.product ? (
                    <>
                      {" · "}
                      {formatPrice(item.product.currentPriceCents)}
                      {delta !== undefined ? (
                        <>
                          {" "}
                          <DeltaBadge delta={delta} />
                        </>
                      ) : null}
                    </>
                  ) : item.type === "article" ? (
                    ` · ${item.readProgress ?? 0}% read`
                  ) : null}
                </span>
              </span>
            </OpenItemButton>
          </li>
        );
      })}
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
          {items.map((item) => {
            const delta = item.product ? priceDeltaPercent(item.product) : undefined;
            return (
              <tr key={item.id}>
                <td>
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    aria-label={itemAccessibleLabel(item)}
                  >
                    {item.title}
                    <span>{item.site}</span>
                  </button>
                </td>
                <td><TypeLabel item={item} /></td>
                <td>{item.collection}</td>
                <td>{formatSavedDate(item.savedAt)}</td>
                <td>
                  {item.product ? (
                    <span className="cell-price">
                      {formatPrice(item.product.currentPriceCents)}
                      {delta !== undefined ? <DeltaBadge delta={delta} /> : null}
                    </span>
                  ) : item.type === "article" ? (
                    `${item.readProgress ?? 0}% read`
                  ) : (
                    "Saved"
                  )}
                </td>
              </tr>
            );
          })}
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
  if (view === "table") {
    return (
      <>
        <TableView items={items} onOpen={onOpen} />
        <div className="mobile-table-fallback">
          <ListView items={items} onOpen={onOpen} />
        </div>
      </>
    );
  }
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
  const status = productStatusLabel(item);
  if (!status) return null;
  const reached = status === "Target reached";
  return (
    <span className={reached ? "target-reached" : "target-watching"}>
      <Bell aria-hidden />
      {status}
    </span>
  );
}
