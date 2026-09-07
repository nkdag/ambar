"use client";

/* eslint-disable react-hooks/set-state-in-effect -- reset dialog-local drafts on dismissal and item change */
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { RiArchive2Line as Archive, RiArrowRightSLine as ChevronRight, RiErrorWarningLine as CircleAlert, RiExternalLinkLine as ExternalLink, RiFileUploadLine as FileUp, RiFolderOpenLine as FolderOpen, RiLink as Link2, RiSearchLine as Search, RiPriceTag3Line as Tags, RiUpload2Line as Upload, RiCloseLine as X, RiCheckLine as Check, RiAddLine as Plus } from "@remixicon/react";
import { TextArea } from "react-aria-components";
import { ItemVisual, ProductStatus, Sparkline } from "@/components/archive-items";
import { ArchiveDialog, DetailTabs } from "./archive-overlays";
import { NavIcon } from "./archive-navigation";
import { Button } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Input, InputBase, TextField } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { Select, SelectItem } from "@/components/base/select/select";
import { SegmentedControl, SegmentedControlItem } from "@/components/base/segmented-control/segmented-control";
import { Switch } from "@/components/base/switch/switch";
import { filterArchiveItems, formatPrice, formatTargetInput, parseTargetInput, priceDeltaPercent, type ArchiveItem, type ItemType } from "@/domain/archive";
import { parseChromeBookmarks, type ChromeBookmarkPreview } from "@/domain/bookmarks";
import { demoChromeExport } from "@/data/fixtures";

type SearchScope = "all" | "products" | "reading";

export function SearchDialog({
  open,
  onClose,
  items,
  onOpenItem,
}: {
  open: boolean;
  onClose: () => void;
  items: ArchiveItem[];
  onOpenItem: (item: ArchiveItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (!open) {
      setQuery("");
      setScope("all");
    }
  }, [open]);
  const results = useMemo(
    () =>
      filterArchiveItems(items, {
        query,
        section: scope === "all" ? "inbox" : scope,
      }).slice(0, 6),
    [items, query, scope],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, scope, open]);

  const listboxId = "search-results-listbox";
  const optionId = (item: ArchiveItem) => `search-option-${item.id}`;
  const activeOption = results[activeIndex];

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && activeOption) {
      event.preventDefault();
      onOpenItem(activeOption);
    }
  };

  return (
    <ArchiveDialog
      open={open}
      onClose={onClose}
      placement="center"
      ariaLabel="Search and filter archive"
      className="command-modal"
    >
      <div className="modal-heading command-heading">
        <Search aria-hidden />
        <InputBase
          autoFocus
          type="search"
          placeholder="Search titles, notes, tags…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search archive"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? optionId(activeOption) : undefined}
        />
        <IconButton icon={X} aria-label="Close search" onClick={onClose} />
      </div>
      <SegmentedControl className="command-filters" aria-label="Filter search" selectedKeys={new Set([scope])} onSelectionChange={(keys) => setScope([...keys][0] as SearchScope)}>{(["all", "products", "reading"] as const).map((value) => <SegmentedControlItem key={value} id={value}>{value === "all" ? "All items" : value}</SegmentedControlItem>)}</SegmentedControl>
      <div className="command-results">
        <p>{query ? `${results.length} matches` : "Recently saved"}</p>
        {results.length ? (
          <ul id={listboxId} role="listbox" aria-label="Search results">
            {results.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={item.id} role="none">
                  <button
                    type="button"
                    id={optionId(item)}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    onClick={() => onOpenItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="result-icon"><NavIcon section={item.type === "product" ? "products" : item.type === "article" ? "reading" : "inbox"} /></span>
                    <span><strong>{item.title}</strong><small>{item.site} · {item.collection}</small></span>
                    <ChevronRight aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="command-empty">No exact match. Try a site, collection, tag, or note.</div>
        )}
      </div>
      <div className="command-footer"><span>Type to filter by title, site, collection, tag, or note.</span></div>
    </ArchiveDialog>
  );
}

export function QuickSaveDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (input: { url: string; title?: string; note?: string; type: ItemType }) => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<ItemType>("link");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setUrl("");
      setTitle("");
      setNote("");
      setType("link");
      setError("");
      setSaving(false);
    }
  }, [open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave({ url, title, note, type });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "This link could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ArchiveDialog
      open={open}
      onClose={onClose}
      placement="center"
      ariaLabel="Quick save"
      className="save-modal"
    >
      <form onSubmit={submit} className="save-form">
        <div className="modal-title-row">
          <div><p>Quick save</p><h2>Give this link a place.</h2></div>
          <IconButton type="button"  onClick={onClose} aria-label="Close quick save" icon={X} />
        </div>
        <Input label="Link" aria-label="Link" autoFocus type="url" isRequired leadingIcon={Link2} placeholder="https://…" value={url} onChange={(value) => { setUrl(value); setError(""); }} isInvalid={Boolean(error)} />
        <div className="field-row">
          <div className="select-field"><span id="quick-save-kind" className="text-body-medium">Kind</span><Select aria-labelledby="quick-save-kind" selectedKey={type} onSelectionChange={(key) => setType(key as ItemType)}><SelectItem id="link">Link</SelectItem><SelectItem id="article">Article</SelectItem><SelectItem id="product">Product</SelectItem></Select></div>
          <Input label="Title (optional)" placeholder="A useful name" value={title} onChange={setTitle} />
        </div>
        <TextField value={note} onChange={setNote}><Label>Note (optional)</Label><TextArea rows={3} placeholder="Why is this worth keeping?" className="archive-textarea" /></TextField>
        {error ? <p className="form-error" role="alert"><CircleAlert aria-hidden />{error}</p> : null}
        <div className="modal-actions"><span>Saved locally to Inbox</span><Button type="submit" variant="primary" disabled={saving} leadingIcon={Plus}>{saving ? "Saving…" : "Save item"}</Button></div>
      </form>
    </ArchiveDialog>
  );
}

export function ImportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<ChromeBookmarkPreview[]>([]);
  const [message, setMessage] = useState("Choose an exported Chrome HTML file. Parsing stays in this tab.");

  useEffect(() => {
    if (!open) {
      setPreview([]);
      setMessage("Choose an exported Chrome HTML file. Parsing stays in this tab.");
    }
  }, [open]);

  const previewHtml = (html: string) => {
    const records = parseChromeBookmarks(html);
    setPreview(records);
    setMessage(records.length ? `${records.length} safe bookmarks ready to review.` : "No safe web bookmarks were found in that file.");
  };

  const fileChanged = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      setPreview([]);
      setMessage("That file is over the 2 MB prototype limit.");
      return;
    }
    try {
      previewHtml(await file.text());
    } catch {
      setPreview([]);
      setMessage("This file could not be read. Choose another HTML file or use the safe demo export.");
    }
  };

  return (
    <ArchiveDialog
      open={open}
      onClose={onClose}
      placement="center"
      ariaLabel="Chrome bookmark import preview"
      className="import-modal"
    >
      <div className="modal-title-row">
        <div><p>Chrome import</p><h2>Preview before anything moves.</h2></div>
        <IconButton type="button"  onClick={onClose} aria-label="Close import" icon={X} />
      </div>
      <div className="import-safety"><FileUp aria-hidden /><span><strong>Local, detached parsing</strong>Scripts, handlers, and non-web URLs are discarded. This preview never renders imported HTML.</span></div>
      <p className="import-message" aria-live="polite">{message}</p>
      {preview.length ? (
        <ul className="import-preview">
          {preview.map((bookmark) => (
            <li key={`${bookmark.url}-${bookmark.folder}`}><span><strong>{bookmark.title}</strong><small>{bookmark.site} · {bookmark.folder}</small></span><Check aria-hidden /></li>
          ))}
        </ul>
      ) : (
        <label className="file-drop">
          <Upload aria-hidden />
          <strong>Select bookmark HTML</strong>
          <span>Chrome → Bookmark Manager → Export bookmarks</span>
          <input autoFocus type="file" accept=".html,text/html" onChange={fileChanged} />
        </label>
      )}
      <div className="modal-actions">
        <Button type="button" variant="ghost" onClick={() => previewHtml(demoChromeExport)}>Use safe demo export</Button>
        {preview.length ? <Button type="button" variant="primary" onClick={onClose}>Done reviewing</Button> : null}
      </div>
    </ArchiveDialog>
  );
}

export function DetailDrawer({
  item,
  onClose,
  onTargetUpdate,
}: {
  item: ArchiveItem | null;
  onClose: () => void;
  onTargetUpdate: (itemId: string, cents: number | undefined, enabled: boolean) => Promise<void>;
}) {
  const [target, setTarget] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [targetError, setTargetError] = useState("");
  const [targetSaving, setTargetSaving] = useState(false);

  useEffect(() => {
    setTarget(formatTargetInput(item?.product?.targetPriceCents));
    setAlertEnabled(item?.product?.alertEnabled ?? false);
    setTargetError("");
    setTargetSaving(false);
  }, [item]);

  if (!item) return null;

  const date = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(item.savedAt));
  const delta = item.product ? priceDeltaPercent(item.product) : undefined;

  const detailContent = (
    <div className="detail-tab-content">
      <div className="detail-note"><p>Your note</p><span>{item.note || "No note yet. This item still keeps its source and archive context."}</span></div>
      <dl className="detail-list">
        <div><dt><FolderOpen aria-hidden />Collection</dt><dd>{item.collection}</dd></div>
        <div><dt><Tags aria-hidden />Tags</dt><dd>{item.tags.join(" · ")}</dd></div>
        <div><dt><Archive aria-hidden />Saved</dt><dd>{date}</dd></div>
      </dl>
      <a className="source-link" href={item.url} target="_blank" rel="noreferrer"><span><Link2 aria-hidden />{item.site}</span><ExternalLink aria-hidden /></a>
    </div>
  );

  const activityContent = item.product ? (
    <div className="price-panel">
      <div className="price-headline">
        <div><p>Current price</p><strong>{formatPrice(item.product.currentPriceCents)}</strong></div>
        <div><p>Previous</p><span>{formatPrice(item.product.previousPriceCents)}</span>{delta !== undefined ? <small className={delta < 0 ? "delta-down" : "delta-up"}>{delta > 0 ? "+" : ""}{delta.toFixed(0)}%</small> : null}</div>
      </div>
      <Sparkline values={item.product.priceHistoryCents} />
      <div className="sparkline-caption"><span>30 days ago</span><span>Today</span></div>
      <form
        className="target-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (targetSaving) return;
          setTargetSaving(true);
          try {
            await onTargetUpdate(item.id, parseTargetInput(target), alertEnabled);
            setTargetError("");
          } catch (caught) {
            setTargetError(caught instanceof Error ? caught.message : "Enter a valid target price");
          } finally {
            setTargetSaving(false);
          }
        }}
      >
        <Input label="Target price" leadingAddon={<span>$</span>} inputMode="decimal" value={target} onChange={(value) => { setTarget(value); setTargetError(""); }} aria-label="Target price in dollars" isInvalid={Boolean(targetError)} />
        {targetError ? <p className="form-error" role="alert"><CircleAlert aria-hidden />{targetError}</p> : null}
        <Switch isSelected={alertEnabled} onChange={setAlertEnabled} className="toggle-row"><span><strong>Price alert</strong><small>Local prototype state only</small></span></Switch>
        <Button type="submit" variant="primary" disabled={targetSaving}>{targetSaving ? "Updating…" : "Update target"}</Button>
      </form>
    </div>
  ) : (
    <div className="reading-panel">
      <p>{item.type === "article" ? "Reading progress" : "Source status"}</p>
      <strong>{item.type === "article" ? `${item.readProgress ?? 0}%` : "Saved"}</strong>
      {item.type === "article" ? <div className="large-progress"><span style={{ width: `${item.readProgress ?? 0}%` }} /></div> : null}
      <span>{item.type === "article" ? "Progress is local to this prototype and resets on reload." : "The link is indexed locally. AMBAR does not fetch or execute the source page."}</span>
    </div>
  );

  return (
    <ArchiveDialog open onClose={onClose} placement="right" ariaLabel={`Details for ${item.title}`} className="detail-drawer">
      <div className="drawer-header"><span>Archive slip · {item.id.slice(-3)}</span><IconButton autoFocus type="button"  onClick={onClose} aria-label="Close details" icon={X} /></div>
      <div className="drawer-scroll">
        <ItemVisual item={item} />
        <div className="drawer-title"><span>{item.type} · {item.site}</span><h2>{item.title}</h2>{item.product ? <ProductStatus item={item} /> : null}</div>
        <DetailTabs details={detailContent} activity={activityContent} activityLabel={item.product ? "Price watch" : "Activity"} />
      </div>
    </ArchiveDialog>
  );
}