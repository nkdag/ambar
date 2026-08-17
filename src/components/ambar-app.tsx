"use client";

/* eslint-disable react-hooks/set-state-in-effect -- modal-local state resets when beUI closes or the selected archive item changes */

import {
  Archive,
  Bell,
  BookOpen,
  Box,
  Check,
  ChevronRight,
  CircleAlert,
  Command,
  ExternalLink,
  FileUp,
  FolderOpen,
  GalleryHorizontalEnd,
  Inbox,
  KeyRound,
  LayoutGrid,
  Link2,
  List,
  LoaderCircle,

  Moon,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sun,
  Table2,
  Tags,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  ArchiveItems,
  ItemVisual,
  ProductStatus,
  Sparkline,
  type ViewMode,
} from "@/components/archive-items";
import {
  AnimatedToastStack,
  useAnimatedToastStack,
} from "@/components/motion/animated-toast-stack";
import { Drawer } from "@/components/motion/drawer";
import { MorphingModal } from "@/components/motion/morphing-modal";
import { MorphingTabs } from "@/components/motion/morphing-tabs";
import { archiveFixtures, collectionNames, demoChromeExport } from "@/data/fixtures";
import {
  createQuickSaveItem,
  filterArchiveItems,
  findDuplicateItem,
  formatPrice,
  formatTargetInput,
  parseTargetInput,
  priceDeltaPercent,
  updateProductTarget,
  type ArchiveItem,
  type ArchiveSection,
  type ItemType,
} from "@/domain/archive";
import {
  parseChromeBookmarks,
  type ChromeBookmarkPreview,
} from "@/domain/bookmarks";
import {
  AMBAR_VAULT_KEY,
  mutateVault,
  readVault,
} from "@/domain/vault";

type AppSection = ArchiveSection | "access";
type PreviewState = "ready" | "loading" | "empty" | "error" | "offline";
type ModalName = "search" | "save" | "import" | null;
type SearchScope = "all" | "products" | "reading";
type VaultStatus = "booting" | "example" | "saved" | "recovery" | "write-error";

const sectionCopy: Record<
  ArchiveSection,
  { eyebrow: string; title: string; description: string }
> = {
  inbox: {
    eyebrow: "The live index",
    title: "Everything worth returning to.",
    description: "New saves arrive here first, then settle into the archive.",
  },
  products: {
    eyebrow: "Price notebook",
    title: "Objects under consideration.",
    description: "Real demo histories, clear targets, and no pretend purchasing.",
  },
  reading: {
    eyebrow: "Reading desk",
    title: "Ideas with a place to land.",
    description: "Articles, annotations, and the thread back to where you stopped.",
  },
};

const viewOptions: Array<{
  value: ViewMode;
  label: string;
  icon: typeof List;
}> = [
  { value: "list", label: "List view", icon: List },
  { value: "card", label: "Card view", icon: LayoutGrid },
  { value: "gallery", label: "Gallery view", icon: GalleryHorizontalEnd },
  { value: "table", label: "Table view", icon: Table2 },
];

const stateOptions: Array<{ value: PreviewState; label: string }> = [
  { value: "ready", label: "Live library" },
  { value: "loading", label: "Loading preview" },
  { value: "empty", label: "Empty preview" },
  { value: "error", label: "Error preview" },
  { value: "offline", label: "Offline preview" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`}>
      <span className="brand-mark" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      <span>
        <strong>AMBAR</strong>
        {!compact ? <small>Personal archive</small> : null}
      </span>
    </div>
  );
}

function NavIcon({ section }: { section: AppSection }) {
  if (section === "products") return <Box aria-hidden />;
  if (section === "reading") return <BookOpen aria-hidden />;
  if (section === "access") return <KeyRound aria-hidden />;
  return <Inbox aria-hidden />;
}

function Sidebar({
  section,
  onSectionChange,
  onSave,
  onImport,
  items,
  vaultStatus,
  saveDisabled,
}: {
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
  onSave: () => void;
  onImport: () => void;
  items: ArchiveItem[];
  vaultStatus: VaultStatus;
  saveDisabled: boolean;
}) {
  const productCount = items.filter((item) => item.type === "product").length;
  const readingCount = items.filter((item) => item.type === "article").length;

  return (
    <aside className="sidebar" aria-label="Library navigation">
      <Logo />
      <button type="button" className="quick-save-button" onClick={onSave} disabled={saveDisabled}>
        <Plus aria-hidden />
        Quick save
        <kbd>⌥S</kbd>
      </button>

      <nav className="primary-nav" aria-label="Archive sections">
        <p>Library</p>
        {(
          [
            ["inbox", "Inbox", items.length],
            ["products", "Products", productCount],
            ["reading", "Reading", readingCount],
          ] as Array<[ArchiveSection, string, number]>
        ).map(([value, label, count]) => (
          <button
            type="button"
            key={value}
            aria-current={section === value ? "page" : undefined}
            onClick={() => onSectionChange(value)}
          >
            <NavIcon section={value} />
            <span>{label}</span>
            <small>{count.toString().padStart(2, "0")}</small>
          </button>
        ))}
      </nav>

      <div className="collection-list">
        <p>Collections</p>
        {collectionNames.map((name) => (
          <span key={name}>
            <i aria-hidden />
            {name}
          </span>
        ))}
      </div>

      <div className="sidebar-foot">
        <button type="button" onClick={onImport}>
          <Upload aria-hidden />
          Import bookmarks
        </button>
        <button
          type="button"
          aria-current={section === "access" ? "page" : undefined}
          onClick={() => onSectionChange("access")}
        >
          <KeyRound aria-hidden />
          Agent Access
          <span>Next</span>
        </button>
        <p className={`vault-status vault-status-${vaultStatus}`} role="status">
          <span className="local-dot" />
          {vaultStatus === "booting"
            ? "Opening local vault"
            : vaultStatus === "example"
              ? "Example vault · not saved"
              : vaultStatus === "saved"
                ? "Saved on this device"
                : vaultStatus === "recovery"
                  ? "Local vault needs recovery"
                  : "Local changes are not saved"}
        </p>
      </div>
    </aside>
  );
}

function Header({
  onSearch,
  onSave,
  theme,
  onThemeToggle,
  section,
  onSectionChange,
  saveDisabled,
}: {
  onSearch: () => void;
  onSave: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
  saveDisabled: boolean;
}) {
  return (
    <header className="topbar">
      <div className="mobile-brand"><Logo compact /></div>
      <nav className="tablet-nav" aria-label="Current archive section">
        {(["inbox", "products", "reading"] as ArchiveSection[]).map((value) => (
          <button
            type="button"
            key={value}
            aria-current={section === value ? "page" : undefined}
            onClick={() => onSectionChange(value)}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </button>
        ))}
      </nav>
      <div className="topbar-actions">
        <button type="button" className="search-trigger" onClick={onSearch} aria-label="Search the archive">
          <Search aria-hidden />
          <span>Search the archive</span>
          <kbd><Command aria-hidden />K</kbd>
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}
          onClick={onThemeToggle}
        >
          {theme === "light" ? <Moon aria-hidden /> : <Sun aria-hidden />}
        </button>
        <button type="button" className="header-save" onClick={onSave} aria-label="Save" disabled={saveDisabled}>
          <Plus aria-hidden />
          <span>Save</span>
        </button>
      </div>
    </header>
  );
}

function MobileNav({
  section,
  onSectionChange,
  onSave,
  saveDisabled,
}: {
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
  onSave: () => void;
  saveDisabled: boolean;
}) {
  const items: Array<{ value: AppSection; label: string }> = [
    { value: "inbox", label: "Inbox" },
    { value: "products", label: "Products" },
    { value: "reading", label: "Reading" },
    { value: "access", label: "Access" },
  ];
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {items.slice(0, 2).map((item) => (
        <button
          type="button"
          key={item.value}
          aria-current={section === item.value ? "page" : undefined}
          onClick={() => onSectionChange(item.value)}
        >
          <NavIcon section={item.value} />
          {item.label}
        </button>
      ))}
      <button type="button" className="mobile-save" onClick={onSave} aria-label="Quick save" disabled={saveDisabled}>
        <Plus aria-hidden />
      </button>
      {items.slice(2).map((item) => (
        <button
          type="button"
          key={item.value}
          aria-current={section === item.value ? "page" : undefined}
          onClick={() => onSectionChange(item.value)}
        >
          <NavIcon section={item.value} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function ArchiveHeader({
  section,
  count,
  view,
  onViewChange,
  previewState,
  onPreviewStateChange,
}: {
  section: ArchiveSection;
  count: number;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  previewState: PreviewState;
  onPreviewStateChange: (state: PreviewState) => void;
}) {
  const copy = sectionCopy[section];
  return (
    <>
      <section className="archive-heading" aria-labelledby="archive-title">
        <div>
          <p>{copy.eyebrow}</p>
          <h1 id="archive-title">{copy.title}</h1>
          <span>{copy.description}</span>
        </div>
        <div className="index-stamp" aria-label={`${count} visible items`}>
          <span>INDEX</span>
          <strong>{count.toString().padStart(2, "0")}</strong>
          <small>AUG · 2026</small>
        </div>
      </section>

      <div className="archive-toolbar">
        <div className="view-switcher" role="group" aria-label="View style">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                type="button"
                key={option.value}
                aria-label={option.label}
                aria-pressed={view === option.value}
                onClick={() => onViewChange(option.value)}
              >
                <Icon aria-hidden />
              </button>
            );
          })}
        </div>
        {process.env.NODE_ENV !== "production" ? (
          <details className="demo-controls">
            <summary><SlidersHorizontal aria-hidden />Demo states</summary>
            <label>
              <span className="sr-only">Preview state</span>
              <select
                aria-label="Preview state"
                value={previewState}
                onChange={(event) => onPreviewStateChange(event.target.value as PreviewState)}
              >
                {stateOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </details>
        ) : null}
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div className="state-panel loading-state" aria-label="Loading archive" aria-busy="true">
      <div className="skeleton skeleton-wide" />
      <div className="skeleton" />
      <div className="skeleton skeleton-short" />
      <p><LoaderCircle aria-hidden /> Sorting the local index…</p>
    </div>
  );
}

function EmptyState({ onSave }: { onSave: () => void }) {
  return (
    <div className="state-panel centered-state">
      <Archive aria-hidden />
      <p>Nothing on this shelf yet</p>
      <h2>Give the archive its first thread.</h2>
      <span>Save a link now, or switch the preview back to your live library.</span>
      <button type="button" className="primary-button" onClick={onSave}>
        <Plus aria-hidden /> Quick save
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="state-panel centered-state error-state">
      <CircleAlert aria-hidden />
      <p>Index unavailable</p>
      <h2>The local preview could not be arranged.</h2>
      <span>Your demo items are still intact. Retry to return to the live library.</span>
      <button type="button" className="secondary-button" onClick={onRetry}>
        <RefreshCw aria-hidden /> Retry preview
      </button>
    </div>
  );
}

function AgentAccess() {
  return (
    <section className="access-page" aria-labelledby="access-title">
      <div className="access-intro">
        <span className="coming-next">Coming next</span>
        <p>Agent Access</p>
        <h1 id="access-title">Your archive, available on your terms.</h1>
        <span>
          A future scoped CLI and MCP surface will let tools read only the parts of AMBAR you choose. Nothing is connected in this prototype.
        </span>
      </div>
      <div className="access-grid">
        <article>
          <KeyRound aria-hidden />
          <p>Scoped by default</p>
          <h2>Small keys, clear limits.</h2>
          <span>Separate read scopes for the library, products, and price history—with expiry and revocation planned.</span>
          <div className="scope-list">
            <code>library:read</code>
            <code>products:read</code>
            <code>prices:read</code>
          </div>
        </article>
        <article>
          <Bell aria-hidden />
          <p>Auditable</p>
          <h2>Every visit leaves a trace.</h2>
          <span>Future access will show when a credential was used and what boundary it touched.</span>
          <div className="audit-preview">
            <span><i /> No access events</span>
            <small>Connections are unavailable in v0</small>
          </div>
        </article>
      </div>
      <div className="access-callout">
        <div>
          <Check aria-hidden />
          <span><strong>Honest prototype boundary</strong>No token creation, connection, or agent action exists here today.</span>
        </div>
        <button type="button" disabled>Available after v0</button>
      </div>
    </section>
  );
}

function SearchDialog({
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
    <MorphingModal
      viewId={open ? "search" : null}
      onClose={onClose}
      placement="center"
      ariaLabel="Search and filter archive"
      className="command-modal"
    >
      <div className="modal-heading command-heading">
        <Search aria-hidden />
        <input
          data-autofocus
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
        <kbd>esc</kbd>
      </div>
      <div className="command-filters" role="group" aria-label="Filter search">
        {(["all", "products", "reading"] as SearchScope[]).map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={scope === value}
            onClick={() => setScope(value)}
          >
            {value === "all" ? "All items" : value}
          </button>
        ))}
      </div>
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
    </MorphingModal>
  );
}

function QuickSaveDialog({
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
    <MorphingModal
      viewId={open ? "quick-save" : null}
      onClose={onClose}
      placement="center"
      ariaLabel="Quick save"
      className="save-modal"
    >
      <form onSubmit={submit} className="save-form">
        <div className="modal-title-row">
          <div><p>Quick save</p><h2>Give this link a place.</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close quick save"><X aria-hidden /></button>
        </div>
        <label>
          Link
          <div className="input-with-icon"><Link2 aria-hidden /><input data-autofocus type="url" required placeholder="https://…" value={url} onChange={(event) => { setUrl(event.target.value); setError(""); }} /></div>
        </label>
        <div className="field-row">
          <label>
            Kind
            <select value={type} onChange={(event) => setType(event.target.value as ItemType)}>
              <option value="link">Link</option>
              <option value="article">Article</option>
              <option value="product">Product</option>
            </select>
          </label>
          <label>
            Title <span>optional</span>
            <input type="text" placeholder="A useful name" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
        </div>
        <label>
          Note <span>optional</span>
          <textarea rows={3} placeholder="Why is this worth keeping?" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        {error ? <p className="form-error" role="alert"><CircleAlert aria-hidden />{error}</p> : null}
        <div className="modal-actions"><span>Saved locally to Inbox</span><button type="submit" className="primary-button" disabled={saving}><Plus aria-hidden />{saving ? "Saving…" : "Save item"}</button></div>
      </form>
    </MorphingModal>
  );
}

function ImportDialog({
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
    previewHtml(await file.text());
  };

  return (
    <MorphingModal
      viewId={open ? (preview.length ? "preview" : "choose") : null}
      onClose={onClose}
      placement="center"
      ariaLabel="Chrome bookmark import preview"
      className="import-modal"
    >
      <div className="modal-title-row">
        <div><p>Chrome import</p><h2>Preview before anything moves.</h2></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close import"><X aria-hidden /></button>
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
          <input data-autofocus type="file" accept=".html,text/html" onChange={fileChanged} />
        </label>
      )}
      <div className="modal-actions">
        <button type="button" className="text-button" onClick={() => previewHtml(demoChromeExport)}>Use safe demo export</button>
        {preview.length ? <button type="button" className="primary-button" onClick={onClose}>Done reviewing</button> : null}
      </div>
    </MorphingModal>
  );
}

function DetailDrawer({
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

  const handleOpenChange = useCallback((value: boolean) => {
    if (!value) onClose();
  }, [onClose]);

  if (!item) return <Drawer open={false} onOpenChange={() => undefined}>{null}</Drawer>;

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
        <label>Target price<div className="price-input"><span>$</span><input inputMode="decimal" value={target} onChange={(event) => { setTarget(event.target.value); setTargetError(""); }} aria-label="Target price in dollars" aria-invalid={Boolean(targetError)} /></div></label>
        {targetError ? <p className="form-error" role="alert"><CircleAlert aria-hidden />{targetError}</p> : null}
        <label className="toggle-row"><span><strong>Price alert</strong><small>Local prototype state only</small></span><input type="checkbox" checked={alertEnabled} onChange={(event) => setAlertEnabled(event.target.checked)} /></label>
        <button type="submit" className="primary-button" disabled={targetSaving}>{targetSaving ? "Updating…" : "Update target"}</button>
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
    <Drawer open onOpenChange={handleOpenChange} ariaLabel={`Details for ${item.title}`} className="detail-drawer">
      <div className="drawer-header"><span>Archive slip · {item.id.slice(-3)}</span><button data-autofocus type="button" className="icon-button" onClick={onClose} aria-label="Close details"><X aria-hidden /></button></div>
      <div className="drawer-scroll">
        <ItemVisual item={item} />
        <div className="drawer-title"><span>{item.type} · {item.site}</span><h2>{item.title}</h2>{item.product ? <ProductStatus item={item} /> : null}</div>
        <MorphingTabs
          ariaLabel="Item detail sections"
          items={[
            { id: "details", label: "Details", content: detailContent },
            { id: "activity", label: item.product ? "Price watch" : "Activity", content: activityContent },
          ]}
          classNames={{
            root: "detail-tabs",
            activeTab: "detail-active-tab",
            tab: "detail-tab",
            label: "detail-tab-label",
            content: "detail-tab-panel",
          }}
        />
      </div>
    </Drawer>
  );
}

export function AmbarApp() {
  const [items, setItems] = useState<ArchiveItem[]>(archiveFixtures);
  const [section, setSection] = useState<AppSection>("inbox");
  const [view, setView] = useState<ViewMode>("list");
  const [previewState, setPreviewState] = useState<PreviewState>("ready");
  const [modal, setModal] = useState<ModalName>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>("booting");
  const pendingMutation = useRef<((current: ArchiveItem[]) => ArchiveItem[]) | null>(null);
  const writeInFlight = useRef(false);
  const { toasts, showToast, dismissToast } = useAnimatedToastStack({ limit: 3 });

  const closeModal = useCallback(() => setModal(null), []);
  const closeItem = useCallback(() => setSelectedId(null), []);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;
  const archiveSection: ArchiveSection = section === "access" ? "inbox" : section;
  const visibleItems = useMemo(
    () => filterArchiveItems(items, { section: archiveSection }),
    [archiveSection, items],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const vault = readVault(window.localStorage);
    if (vault.status === "ready") {
      setItems(vault.items);
      setVaultStatus("saved");
    } else if (vault.status === "empty") {
      setVaultStatus("example");
    } else {
      setVaultStatus("recovery");
    }
  }, []);

  useEffect(() => {
    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== AMBAR_VAULT_KEY) return;
      const vault = readVault(window.localStorage);
      if (vault.status === "ready") {
        setItems(vault.items);
        setVaultStatus(pendingMutation.current ? "write-error" : "saved");
      } else if (vault.status === "empty") {
        setVaultStatus(pendingMutation.current ? "write-error" : "example");
      } else {
        setVaultStatus("recovery");
      }
    };
    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSelectedId(null);
        setModal("search");
      }
      if (
        event.code === "KeyS" &&
        !event.metaKey &&
        !event.ctrlKey &&
        event.altKey &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target instanceof HTMLSelectElement)
      ) {
        setSelectedId(null);
        setModal("save");
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const openItem = (item: ArchiveItem) => {
    setModal(null);
    setSelectedId(item.id);
  };

  const persistItems = async (
    transform: (current: ArchiveItem[]) => ArchiveItem[],
    allowRecovery = false,
  ) => {
    if (vaultStatus === "booting" || writeInFlight.current) {
      return { ok: false as const, reason: "busy" as const };
    }
    pendingMutation.current = transform;
    writeInFlight.current = true;
    const result = await mutateVault(
      window.localStorage,
      transform,
      new Date(),
      allowRecovery,
    ).catch(() => ({ ok: false as const, reason: "write-error" as const }));
    writeInFlight.current = false;
    if (result.ok) {
      pendingMutation.current = null;
      setItems(result.items);
      setVaultStatus("saved");
    } else if (result.reason === "corrupt") {
      setVaultStatus("recovery");
    } else {
      setVaultStatus("write-error");
    }
    return result;
  };

  const saveItem = async (input: { url: string; title?: string; note?: string; type: ItemType }) => {
    if (vaultStatus === "booting" || vaultStatus === "recovery") {
      showToast({
        status: "error",
        title: vaultStatus === "booting" ? "Local vault is opening" : "Recover the local vault first",
        description: vaultStatus === "booting"
          ? "Wait a moment before saving."
          : "Your unreadable vault has not been replaced.",
      });
      return;
    }

    const next = createQuickSaveItem(input, {
      id: window.crypto.randomUUID(),
      now: new Date(),
    });
    let duplicate: ArchiveItem | undefined;
    const result = await persistItems((current) => {
      duplicate = findDuplicateItem(current, input.url);
      return duplicate ? current : [next, ...current];
    });

    if (duplicate && result.ok) {
      setModal(null);
      setSelectedId(duplicate.id);
      showToast({
        status: "error",
        title: "Already in your vault",
        description: duplicate.title,
      });
      return;
    }

    const saved = result.ok;
    setPreviewState("ready");
    setSection("inbox");
    setModal(null);
    showToast({
      status: saved ? "success" : "error",
      title: saved ? "Saved to Inbox" : "Local save failed",
      description: saved
        ? next.title
        : result.reason === "busy"
          ? "Another AMBAR tab is saving. Retry in a moment."
          : "Retry local storage before closing this page.",
    });
  };

  const updateTarget = async (itemId: string, cents: number | undefined, enabled: boolean) => {
    if (vaultStatus === "booting" || vaultStatus === "recovery" || vaultStatus === "example") {
      showToast({
        status: "error",
        title: "Start your local vault first",
        description: "Save a personal piece before changing price targets.",
      });
      return;
    }
    const result = await persistItems((current) => updateProductTarget(current, itemId, cents, enabled));
    showToast({
      status: result.ok ? "success" : "error",
      title: result.ok ? "Target updated" : "Target is not saved",
      description: result.ok
        ? cents === undefined
          ? "Price target cleared."
          : `Watching ${formatPrice(cents)}${enabled ? " with an alert." : "."}`
        : result.reason === "busy"
          ? "Another AMBAR tab is saving. Retry in a moment."
          : "Retry local storage before closing this page.",
    });
  };

  const repairVault = async () => {
    const retry = pendingMutation.current ?? (
      vaultStatus === "recovery"
        ? () => []
        : (current: ArchiveItem[]) => current
    );
    const result = await persistItems(retry, vaultStatus === "recovery");
    if (result.ok) {
      setPreviewState(result.items.length === 0 ? "empty" : "ready");
      showToast({
        status: "success",
        title: "Local vault ready",
        description: "This archive will now stay on this device.",
      });
    }
  };

  const overlayOpen = modal !== null || selectedItem !== null;
  const saveDisabled = vaultStatus === "booting" || vaultStatus === "recovery";

  return (
    <div className="app-shell">
      <div
        className="app-underlay"
        inert={overlayOpen ? true : undefined}
        aria-hidden={overlayOpen ? true : undefined}
      >
      <Sidebar
        section={section}
        onSectionChange={(value) => { setSection(value); setPreviewState("ready"); }}
        onSave={() => setModal("save")}
        onImport={() => setModal("import")}
        items={items}
        vaultStatus={vaultStatus}
        saveDisabled={saveDisabled}
      />
      <div className="workspace">
        <Header
          onSearch={() => setModal("search")}
          onSave={() => setModal("save")}
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === "light" ? "dark" : "light")}
          section={section}
          onSectionChange={(value) => { setSection(value); setPreviewState("ready"); }}
          saveDisabled={saveDisabled}
        />
        <div
          className={`responsive-vault-status vault-status-${vaultStatus}`}
          data-testid="responsive-vault-status"
          role="status"
        >
          <span className="local-dot" />
          <span>
            {vaultStatus === "saved"
              ? "Saved on this device"
              : vaultStatus === "example"
                ? "Example only · not saved"
                : vaultStatus === "booting"
                  ? "Opening local vault"
                  : "Local vault attention needed"} · no cloud sync
          </span>
        </div>
        <main className="main-content">
          {vaultStatus === "example" ? (
            <div className="example-vault-banner" role="status">
              <Archive aria-hidden />
              <span><strong>Example vault</strong>These sample pieces are not in your personal vault.</span>
              <button type="button" onClick={() => setModal("save")}>Save your first piece</button>
            </div>
          ) : null}
          {vaultStatus === "recovery" || vaultStatus === "write-error" ? (
            <div className="vault-notice" role="alert">
              <CircleAlert aria-hidden />
              <span>
                <strong>{vaultStatus === "recovery" ? "Local vault needs recovery" : "Local changes are not saved"}</strong>
                {vaultStatus === "recovery"
                  ? "The starter archive is open, but the unreadable vault has not been replaced."
                  : "AMBAR is still usable in this tab. Check browser storage, then retry."}
              </span>
              <button type="button" onClick={repairVault}>
                {vaultStatus === "recovery" ? "Start a fresh local vault" : "Retry local save"}
              </button>
            </div>
          ) : null}
          {section === "access" ? (
            <AgentAccess />
          ) : (
            <>
              <ArchiveHeader
                section={section}
                count={previewState === "empty" ? 0 : visibleItems.length}
                view={view}
                onViewChange={setView}
                previewState={previewState}
                onPreviewStateChange={setPreviewState}
              />
              {previewState === "offline" ? (
                <div className="offline-banner" role="status"><WifiOff aria-hidden /><span><strong>Offline preview</strong>Showing the last four locally cached items.</span><button type="button" onClick={() => setPreviewState("ready")}>Exit preview</button></div>
              ) : null}
              {previewState === "loading" ? <LoadingState /> : null}
              {previewState === "empty" ? <EmptyState onSave={() => setModal("save")} /> : null}
              {previewState === "error" ? <ErrorState onRetry={() => setPreviewState("ready")} /> : null}
              {previewState === "ready" || previewState === "offline" ? (
                <ArchiveItems items={previewState === "offline" ? visibleItems.slice(0, 4) : visibleItems} view={view} onOpen={openItem} />
              ) : null}
            </>
          )}
        </main>
        <footer className="workspace-footer"><span>AMBAR Local Vault · single-device archive</span><span>{vaultStatus === "saved" ? "Saved on this device" : vaultStatus === "example" ? "Example only · not saved" : "Local vault attention needed"} · no cloud sync</span></footer>
      </div>

      <MobileNav section={section} onSectionChange={(value) => { setSection(value); setPreviewState("ready"); }} onSave={() => setModal("save")} saveDisabled={saveDisabled} />
      </div>
      <SearchDialog open={modal === "search"} onClose={closeModal} items={items} onOpenItem={openItem} />
      <QuickSaveDialog open={modal === "save"} onClose={closeModal} onSave={saveItem} />
      <ImportDialog open={modal === "import"} onClose={closeModal} />
      <DetailDrawer item={selectedItem} onClose={closeItem} onTargetUpdate={updateTarget} />
      <AnimatedToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        position="bottom-right"
        fixed
        classNames={{ surface: "ambar-toast" }}
      />
    </div>
  );
}
