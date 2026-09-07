"use client";

import { OverviewHero } from "./overview-hero";
import { Spotlight } from "@/components/base/spotlight/spotlight";
import { cx } from "@/utils/cx";
import { useState } from "react";
import { RiArchive2Line, RiArrowRightLine, RiBookOpenLine, RiFolderLine, RiNotification3Line, RiTimeLine } from "@remixicon/react";
import { Button as AriaButton } from "react-aria-components";
import { StatCards, type Stat } from "@/components/application/dashboard/stat-cards";
import { RevenueChartCard } from "@/components/application/dashboard/revenue-chart-card";
import { OrdersChartCard } from "@/components/application/dashboard/orders-chart-card";
import { ImportantAlertsCard } from "@/components/application/medical/important-alerts-card";
import { archiveOverview } from "@/components/application/overview-data";
import { Button } from "@/components/base/buttons/button";
import { Select, SelectItem } from "@/components/base/select/select";
import { Chip } from "@/components/base/badges/chip";
import { ItemVisual } from "@/components/archive-items";
import { formatPrice, type ArchiveItem, type ArchiveSection } from "@/domain/archive";

export function ArchiveOverview({ items, onNavigate, onCollection, onOpen, onSave, saveDisabled }: {
  items: ArchiveItem[];
  onNavigate: (section: ArchiveSection) => void;
  onCollection: (name: string) => void;
  onOpen: (item: ArchiveItem) => void;
  onSave: () => void;
  saveDisabled: boolean;
}) {
  const data = archiveOverview(items);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const product = data.priced.find((item) => item.id === selectedProduct) ?? data.priced[0];
  const stats: Stat[] = [
    { icon: RiArchive2Line, label: "Saved items", tone: "sky", value: String(items.length), numericValue: items.length, delta: `${data.products.length} products`, deltaColor: "neutral" },
    { icon: RiFolderLine, label: "Collections", tone: "orange", value: String(data.collections.length), numericValue: data.collections.length, delta: "Organized", deltaColor: "neutral" },
    { icon: RiBookOpenLine, label: "Reading queue", tone: "emerald", value: String(data.queue.length), numericValue: data.queue.length, delta: `${data.complete} finished`, deltaColor: "lime" },
    { icon: RiNotification3Line, label: "Price watch", tone: "blue", value: String(data.watched.length), numericValue: data.watched.length, delta: `${data.reached.length} at target`, deltaColor: data.reached.length ? "lime" : "neutral" },
  ];
  return <div className="overview">
    <OverviewHero onBrowse={() => onNavigate("inbox")} />
    <section aria-label="Library at a glance"><StatCards stats={stats} className="overview-stats" /></section>
    {!items.length && <div className="overview-empty"><RiArchive2Line aria-hidden /><div><h2>Nothing on this shelf yet</h2><p>Save a link to bring your Control Room to life.</p></div><Button onClick={onSave} disabled={saveDisabled}>Quick save</Button></div>}
    <div className="overview-chart-grid">
      <section className="overview-panel trend-panel" aria-labelledby="price-trend-heading">
        <div className="panel-heading"><h2 id="price-trend-heading">Price perspective</h2><Chip color="cyan" variant="caption">Saved observations</Chip></div>
        {product ? <><Select aria-label="Price history product" selectedKey={product.id} onSelectionChange={(key) => setSelectedProduct(String(key))} className="price-product-select">{data.priced.map((item) => <SelectItem key={item.id} id={item.id}>{item.title}</SelectItem>)}</Select><RevenueChartCard key={`${product.id}-${product.product?.priceHistoryCents.join(",")}`} item={product} onOpen={() => onOpen(product)} /></> : <div className="chart-empty"><RiTimeLine aria-hidden /><h3>No price history yet</h3><p>Saved product observations will appear here.</p><Button variant="secondary" onClick={() => onNavigate("products")}>Browse products</Button></div>}
      </section>
      <OrdersChartCard items={items} />
    </div>
    <div className="overview-detail-grid">
      <section className="overview-panel reading-overview visual-surface" aria-labelledby="reading-heading"><Spotlight /><div className="panel-heading"><h2 id="reading-heading">Pick up where you left off</h2><Button variant="ghost" onClick={() => onNavigate("reading")} trailingIcon={RiArrowRightLine}>Reading</Button></div><p className="panel-description">{data.complete} of {data.reading.length} articles finished. Room for one more idea.</p><div className="reading-queue">{data.queue.slice(0, 2).map((item) => <AriaButton className="reading-queue-item" key={item.id} onPress={() => onOpen(item)} aria-label={`Continue reading ${item.title}`}><span className="reading-cover" aria-hidden><RiBookOpenLine /><span>{item.site}</span></span><span className="reading-item-copy"><small>{item.collection}</small><strong>{item.title}</strong><span className="reading-progress"><progress max={100} value={item.readProgress ?? 0} aria-label={`Reading progress for ${item.title}`} /><span>{item.readProgress ?? 0}%</span></span></span></AriaButton>)}</div>{data.reading.filter((item) => item.readProgress === 100).slice(0, 1).map((item) => <AriaButton key={item.id} className="finished-reading" aria-label={`Revisit ${item.title}`} onPress={() => onOpen(item)}><Chip color="lime" variant="caption">Finished</Chip><span>{item.title}</span><RiArrowRightLine aria-hidden /></AriaButton>)}{!data.queue.length && <p className="panel-empty">Your reading queue is clear</p>}</section>
      <ImportantAlertsCard items={items} onOpen={onOpen} />
    </div>
    <section className="collections-overview" aria-labelledby="collections-heading"><div className="panel-heading"><h2 id="collections-heading">Your shelves</h2><span>{data.collections.length} collections</span></div><div className="collection-cards">{data.collections.map(({ name, count }, index) => <AriaButton key={name} className={cx("collection-card", ["collection-tone-0", "collection-tone-1", "collection-tone-2", "collection-tone-3"][index % 4])} onPress={() => onCollection(name)} aria-label={`Browse collection ${name}`}><RiFolderLine aria-hidden /><strong>{name}</strong><span>{count} {count === 1 ? "item" : "items"}</span><RiArrowRightLine aria-hidden /></AriaButton>)}</div></section>
    <section className="overview-panel recent-overview" aria-labelledby="recent-heading"><div className="panel-heading"><h2 id="recent-heading">Recently saved</h2><Button variant="ghost" onClick={() => onNavigate("inbox")} trailingIcon={RiArrowRightLine}>View all {items.length}</Button></div><div className="recent-table-head" aria-hidden><span>Item</span><span>Collection</span><span>Saved</span><span>Status</span></div><div className="recent-items">{data.recent.slice(0, 4).map((item) => <AriaButton key={item.id} className="recent-row" onPress={() => onOpen(item)} aria-label={`Open ${item.title}`}><span className="recent-title"><ItemVisual item={item} compact /><span><strong>{item.title}</strong><small>{item.site}</small></span></span><span className="recent-collection">{item.collection}</span><time dateTime={item.savedAt}>{new Date(item.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time><span className="recent-status"><Chip color={item.type === "product" ? "cyan" : item.type === "article" ? "lime" : "neutral"} variant="caption">{item.type === "product" ? formatPrice(item.product?.currentPriceCents) : item.type === "article" ? `${item.readProgress ?? 0}% read` : item.status === "processing" ? "Indexing" : "Saved link"}</Chip></span></AriaButton>)}</div>{!items.length && <p className="panel-empty">Your next save starts here.</p>}</section>
    <p className="playground-label">BoardUI Free playground <span>·</span> Local library, real interactions.</p>
  </div>;
}
