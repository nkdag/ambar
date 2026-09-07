"use client";

// Adapted from BoardUI Free medical/important-alerts-card.tsx. MIT; see BOARDUI_SOURCE.json.
import { RiArrowRightSLine, RiNotification3Line, RiPriceTag3Line } from "@remixicon/react";
import { Button as AriaButton } from "react-aria-components";
import { Chip } from "@/components/base/badges/chip";
import { cx } from "@/utils/cx";
import { formatPrice, type ArchiveItem } from "@/domain/archive";

/** BoardUI's inset alert tiles, tinted icon circles and corner status pills.
 * Real watch state replaces the static medical feed; every row opens detail. */
export function ImportantAlertsCard({ items, onOpen }: { items: ArchiveItem[]; onOpen: (item: ArchiveItem) => void }) {
  const watched = items.filter((item) => item.type === "product" && item.product?.alertEnabled).sort((a, b) => {
    const reached = (item: ArchiveItem) => Number(item.product?.currentPriceCents !== undefined && item.product.targetPriceCents !== undefined && item.product.currentPriceCents <= item.product.targetPriceCents);
    return reached(b) - reached(a);
  });
  return <section className="overview-panel watch-panel" aria-labelledby="watch-heading">
    <div className="panel-heading"><h2 id="watch-heading">On your radar</h2><Chip color="yellow"><RiNotification3Line aria-hidden className="size-3.5 mr-1" />{watched.length} watching</Chip></div>
    <p className="panel-description">Price signals from your saved observations.</p>
    <div className="watch-feed">
      {watched.map((item) => {
        const product = item.product!;
        const reached = product.currentPriceCents !== undefined && product.targetPriceCents !== undefined && product.currentPriceCents <= product.targetPriceCents;
        return <AriaButton key={item.id} onPress={() => onOpen(item)} aria-label={`Review price watch for ${item.title}`} className={cx("watch-row", reached && "watch-reached")}>
          <span className="watch-icon"><RiPriceTag3Line aria-hidden /></span>
          <span className="watch-copy"><strong>{item.title}</strong><span>{formatPrice(product.currentPriceCents)} <span>· Target {formatPrice(product.targetPriceCents)}</span></span></span>
          <Chip color={reached ? "lime" : "soft"} variant="caption">{reached ? "Target reached" : "Watching"}</Chip><RiArrowRightSLine className="watch-arrow" aria-hidden />
        </AriaButton>;
      })}
      {!watched.length && <p className="panel-empty">No active price watches. Set a target from a product’s details.</p>}
    </div>
  </section>;
}
