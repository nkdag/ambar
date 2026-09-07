import type { TableHTMLAttributes, Ref } from "react";
import { cx } from "@/utils/cx";

/** BoardUI free Table surface, adapted for AMBAR's non-selectable archive.
 * Native table semantics intentionally preserve the existing caption/cell buttons.
 * No grid selection, sorting or pagination is offered by this slice.
 * Source: BoardUI MIT, see licenses/BoardUI-MIT.txt and BOARDUI_SOURCE.json.
 */
export function Table({ className, ref, ...props }: TableHTMLAttributes<HTMLTableElement> & { ref?: Ref<HTMLTableElement> }) {
  return <table ref={ref} className={cx("bui-table bui-table-sm", className)} {...props} />;
}
