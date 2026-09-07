"use client";

/* eslint-disable react-hooks/set-state-in-effect -- hydrate validated local vault state after mount and on storage events */

import { RiArchive2Line as Archive, RiNotification3Line as Bell, RiCheckLine as Check, RiErrorWarningLine as CircleAlert, RiGalleryLine as GalleryHorizontalEnd, RiKey2Line as KeyRound, RiLayoutGridLine as LayoutGrid, RiListUnordered as List, RiLoader4Line as LoaderCircle, RiAddLine as Plus, RiRefreshLine as RefreshCw, RiEqualizerLine as SlidersHorizontal, RiTableLine as Table2, RiWifiOffLine as WifiOff, RiCloseLine as X } from "@remixicon/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cx } from "@/utils/cx";
import { VisualTransition } from "@/components/application/visual-transition";
import { ArchiveOverview } from "@/components/application/archive-overview";
import { ArchiveItems, type ViewMode } from "@/components/archive-items";
import { ArchiveDialog } from "@/components/application/archive-overlays";
import { SearchDialog, QuickSaveDialog, ImportDialog, DetailDrawer } from "@/components/application/archive-dialogs";
import { ArchiveNotifications, useArchiveNotifications } from "@/components/application/archive-notifications";
import { Header, Sidebar, MobileNav, LibraryNavigation, Logo, VaultDot, type AppSection, type VaultStatus } from "@/components/application/archive-navigation";
import { Button } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Select, SelectItem } from "@/components/base/select/select";
import { SegmentedControl, SegmentedControlItem } from "@/components/base/segmented-control/segmented-control";
import { Badge } from "@/components/base/badges/badge";
import { Chip } from "@/components/base/badges/chip";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { archiveFixtures } from "@/data/fixtures";
import { createQuickSaveItem, filterArchiveItems, findDuplicateItem, formatPrice, updateProductTarget, type ArchiveItem, type ArchiveSection, type ItemType } from "@/domain/archive";
import { AMBAR_VAULT_KEY, mutateVault, readVault } from "@/domain/vault";

type PreviewState = "ready" | "loading" | "empty" | "error" | "offline";
type ModalName = "search" | "save" | "import" | "menu" | null;

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

function ArchiveHeader({
  section,
  collection,
  onClearCollection,
  count,
  view,
  onViewChange,
  previewState,
  onPreviewStateChange,
}: {
  section: ArchiveSection;
  collection: string | null;
  onClearCollection: () => void;
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
          <h1 id="archive-title">{collection ?? copy.title}</h1>
          <span>{collection ? "Everything saved to this collection." : copy.description}</span>
        </div>
        <Badge className="archive-count" aria-label={`${count} visible items`}>{count} items</Badge>
      </section>

      <div className="archive-toolbar">
        <SegmentedControl className="view-switcher" aria-label="View style" selectedKeys={new Set([view])} onSelectionChange={(keys) => onViewChange([...keys][0] as ViewMode)}>
          {viewOptions.map(({ value, label, icon: Icon }) => <TooltipTrigger key={value}><SegmentedControlItem id={value} aria-label={label}><Icon aria-hidden className="size-5" /><span className="view-label">{label.replace(" view", "")}</span></SegmentedControlItem><Tooltip>{label}</Tooltip></TooltipTrigger>)}
        </SegmentedControl>
        {collection && <Button variant="ghost" onClick={onClearCollection}>Clear collection filter</Button>}
        {(
          <details className="demo-controls">
            <summary><SlidersHorizontal aria-hidden />Demo states</summary>
            <Select aria-label="Preview state" selectedKey={previewState} onSelectionChange={(key) => onPreviewStateChange(key as PreviewState)}>{stateOptions.map((option) => <SelectItem id={option.value} key={option.value}>{option.label}</SelectItem>)}</Select>
          </details>
        )}
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
      <span>Save a link to start filling this shelf.</span>
      <Button type="button" variant="primary" onClick={onSave} leadingIcon={Plus}>Quick save
      </Button>
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
      <Button type="button" variant="secondary" onClick={onRetry} leadingIcon={RefreshCw}>Retry preview
      </Button>
    </div>
  );
}

function AgentAccess() {
  return (
    <section className="access-page" aria-labelledby="access-title">
      <div className="access-intro">
        <Chip color="yellow" variant="caption">Coming next</Chip>
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
        <Button variant="secondary" disabled>Available after v0</Button>
      </div>
    </section>
  );
}

export function AmbarApp() {
  const [items, setItems] = useState<ArchiveItem[]>(archiveFixtures);
  const [section, setSection] = useState<AppSection>("overview");
  const [collection, setCollection] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("list");
  const [previewState, setPreviewState] = useState<PreviewState>("ready");
  const [modal, setModal] = useState<ModalName>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>("booting");
  const pendingMutation = useRef<((current: ArchiveItem[]) => ArchiveItem[]) | null>(null);
  const writeInFlight = useRef(false);
  const itemTriggerRef = useRef<HTMLElement | null>(null);
  const { toasts, showToast, dismissToast } = useArchiveNotifications();

  const closeModal = useCallback(() => setModal(null), []);
  const closeItem = useCallback(() => {
    setSelectedId(null);
    window.requestAnimationFrame(() => {
      if (itemTriggerRef.current?.isConnected) itemTriggerRef.current.focus();
      itemTriggerRef.current = null;
    });
  }, []);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;
  const archiveSection: ArchiveSection = section === "access" || section === "overview" ? "inbox" : section;
  const visibleItems = useMemo(
    () => filterArchiveItems(items, { section: archiveSection }).filter((item) => !collection || item.collection === collection),
    [archiveSection, items, collection],
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
    itemTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
    setCollection(null);
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

  const navigate = (value: AppSection) => { setSection(value); setCollection(null); setPreviewState("ready"); };
  const openCollection = (name: string) => { setSection("inbox"); setCollection(name); setPreviewState("ready"); setModal(null); };

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
        onCollection={openCollection}
        section={section}
        onSectionChange={navigate}
        onSave={() => setModal("save")}
        onImport={() => setModal("import")}
        items={items}
        vaultStatus={vaultStatus}
        saveDisabled={saveDisabled}
      />
      <div className="workspace">
        <Header
          onMenu={() => setModal("menu")}
          onSearch={() => setModal("search")}
          onSave={() => setModal("save")}
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === "light" ? "dark" : "light")}
          section={section}
          onSectionChange={navigate}
          saveDisabled={saveDisabled}
        />
        <div
          className={`responsive-vault-status vault-status-${vaultStatus}`}
          data-testid="responsive-vault-status"
          role="status"
        >
          <VaultDot status={vaultStatus} />
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
        <main className={cx("main-content", section === "overview" && "overview-content")}>
          {vaultStatus === "example" ? (
            <div className={cx("example-vault-banner", section === "overview" && "overview-example")} role="status">
              <Archive aria-hidden />
              <span><strong>Example vault</strong>These sample pieces are not in your personal vault.</span>
              <Button variant="secondary" onClick={() => setModal("save")}>Save your first piece</Button>
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
              <Button variant="secondary" onClick={repairVault}>
                {vaultStatus === "recovery" ? "Start a fresh local vault" : "Retry local save"}
              </Button>
            </div>
          ) : null}
          <VisualTransition transitionKey={section}>
          {section === "overview" ? (
            <ArchiveOverview items={items} onNavigate={navigate} onCollection={openCollection} onOpen={openItem} onSave={() => setModal("save")} saveDisabled={saveDisabled} />
          ) : section === "access" ? (
            <AgentAccess />
          ) : (
            <>
              <ArchiveHeader
                collection={collection}
                onClearCollection={() => setCollection(null)}
                section={section}
                count={previewState === "empty" ? 0 : visibleItems.length}
                view={view}
                onViewChange={setView}
                previewState={previewState}
                onPreviewStateChange={setPreviewState}
              />
              {previewState === "offline" ? (
                <div className="offline-banner" role="status"><WifiOff aria-hidden /><span><strong>Offline preview</strong>Showing the last four locally cached items.</span><Button variant="secondary" onClick={() => setPreviewState("ready")}>Exit preview</Button></div>
              ) : null}
              {previewState === "loading" ? <LoadingState /> : null}
              {previewState === "empty" || (previewState === "ready" && visibleItems.length === 0) ? <EmptyState onSave={() => setModal("save")} /> : null}
              {previewState === "error" ? <ErrorState onRetry={() => setPreviewState("ready")} /> : null}
              {(previewState === "ready" && visibleItems.length > 0) || previewState === "offline" ? (
                <VisualTransition transitionKey={view}><ArchiveItems items={previewState === "offline" ? visibleItems.slice(0, 4) : visibleItems} view={view} onOpen={openItem} /></VisualTransition>
              ) : null}
            </>
          )}
          </VisualTransition>
        </main>
        <footer className="workspace-footer"><span>AMBAR Local Vault · single-device archive</span><span>{vaultStatus === "saved" ? "Saved on this device" : vaultStatus === "example" ? "Example only · not saved" : "Local vault attention needed"} · no cloud sync</span></footer>
      </div>

      <MobileNav section={section} onSectionChange={navigate} onSave={() => setModal("save")} saveDisabled={saveDisabled} />
      </div>
      <ArchiveDialog open={modal === "menu"} onClose={closeModal} ariaLabel="Library menu" placement="left" className="library-sheet">
        <div className="library-sheet-heading"><Logo /><IconButton icon={X} aria-label="Close library menu" onClick={closeModal} /></div>
        <LibraryNavigation onCollection={openCollection} section={section} onSectionChange={(value) => { navigate(value); setModal(null); }} onSave={() => setModal("save")} onImport={() => setModal("import")} items={items} vaultStatus={vaultStatus} saveDisabled={saveDisabled} />
      </ArchiveDialog>
      <SearchDialog open={modal === "search"} onClose={closeModal} items={items} onOpenItem={openItem} />
      <QuickSaveDialog open={modal === "save"} onClose={closeModal} onSave={saveItem} />
      <ImportDialog open={modal === "import"} onClose={closeModal} />
      <DetailDrawer item={selectedItem} onClose={closeItem} onTargetUpdate={updateTarget} />
      <ArchiveNotifications toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
