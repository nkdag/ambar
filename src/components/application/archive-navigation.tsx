"use client";

import Link from "next/link";
import { RiAddLine, RiArchive2Line, RiBookOpenLine, RiBox3Line, RiCommandLine, RiFolderLine, RiDashboardLine, RiInbox2Line, RiKey2Line, RiMenuLine, RiMoonLine, RiSearchLine, RiSunLine, RiUpload2Line } from "@remixicon/react";
import { Button as AriaButton } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { Badge } from "@/components/base/badges/badge";
import { StatusDot } from "@/components/base/badges/status-dot";
import { archiveOverview } from "@/components/application/overview-data";
import type { ArchiveItem, ArchiveSection } from "@/domain/archive";
import { cx } from "@/utils/cx";

export type AppSection = ArchiveSection | "overview" | "access";
export type VaultStatus = "booting" | "example" | "saved" | "recovery" | "write-error";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={cx("brand-lockup", compact && "brand-lockup-compact")}><span className="brand-mark"><RiArchive2Line aria-hidden /></span><span><strong>AMBAR</strong>{!compact && <small>Control Room</small>}</span></div>;
}

export function NavIcon({ section }: { section: AppSection }) {
  const Icon = section === "overview" ? RiDashboardLine : section === "products" ? RiBox3Line : section === "reading" ? RiBookOpenLine : section === "access" ? RiKey2Line : RiInbox2Line;
  return <Icon aria-hidden className="size-5 shrink-0" />;
}

export function VaultDot({ status }: { status: VaultStatus }) {
  return <StatusDot color={status === "saved" ? "green" : status === "booting" ? "indigo" : "yellow"} />;
}

export function LibraryNavigation({ section, onSectionChange, onSave, onImport, items, vaultStatus, saveDisabled, onCollection }: {
  onCollection: (name: string) => void;
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
  onSave: () => void;
  onImport: () => void;
  items: ArchiveItem[];
  vaultStatus: VaultStatus;
  saveDisabled: boolean;
}) {
  return <>
    <Button leadingIcon={RiAddLine} onClick={onSave} disabled={saveDisabled} className="quick-save-button">Quick save <kbd>⌥S</kbd></Button>
    <nav className="primary-nav" aria-label="Archive sections">
      <p>Workspace</p>
      <AriaButton aria-current={section === "overview" ? "page" : undefined} onPress={() => onSectionChange("overview")} className="nav-row"><NavIcon section="overview" /><span>Overview</span></AriaButton>
      {([["inbox", "Inbox", items.length], ["products", "Products", items.filter((item) => item.type === "product").length], ["reading", "Reading", items.filter((item) => item.type === "article").length]] as const).map(([value, label, count]) =>
        <AriaButton key={value} aria-current={section === value ? "page" : undefined} onPress={() => onSectionChange(value)} className="nav-row"><NavIcon section={value} /><span>{label}</span><Badge>{count}</Badge></AriaButton>
      )}
    </nav>
    <nav className="collection-list" aria-label="Collections"><p>Collections</p>{archiveOverview(items).collections.map(({ name, count }) => <AriaButton key={name} aria-label={`Open collection ${name}`} onPress={() => onCollection(name)}><RiFolderLine aria-hidden className="size-4" /><span>{name}</span><small>{count}</small></AriaButton>)}</nav>
    <div className="sidebar-foot">
      <AriaButton onPress={onImport} className="nav-row"><RiUpload2Line aria-hidden className="size-5" /><span>Import bookmarks</span></AriaButton>
      <AriaButton aria-current={section === "access" ? "page" : undefined} onPress={() => onSectionChange("access")} className="nav-row"><RiKey2Line aria-hidden className="size-5" /><span>Agent Access</span><Badge>Next</Badge></AriaButton>
      <nav className="legal-links" aria-label="Legal">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
      <p className="vault-status" role="status"><VaultDot status={vaultStatus} />{vaultStatus === "booting" ? "Opening local vault" : vaultStatus === "example" ? "Example vault · not saved" : vaultStatus === "saved" ? "Saved on this device" : vaultStatus === "recovery" ? "Local vault needs recovery" : "Local changes are not saved"}</p>
    </div>
  </>;
}

export function Sidebar(props: Parameters<typeof LibraryNavigation>[0]) {
  return <aside className="sidebar" aria-label="Library navigation"><Logo /><LibraryNavigation {...props} /></aside>;
}

export function Header({ onSearch, onSave, onMenu, theme, onThemeToggle, section, onSectionChange, saveDisabled }: {
  onSearch: () => void; onSave: () => void; onMenu: () => void;
  theme: "light" | "dark"; onThemeToggle: () => void; section: AppSection;
  onSectionChange: (section: AppSection) => void; saveDisabled: boolean;
}) {
  return <header className="topbar">
    <div className="mobile-brand"><IconButton icon={RiMenuLine} aria-label="Open library menu" onClick={onMenu} /><Logo compact /></div>
    <nav className="tablet-nav" aria-label="Current archive section">{(["overview", "inbox", "products", "reading"] as const).map((value) => <AriaButton key={value} aria-current={section === value ? "page" : undefined} onPress={() => onSectionChange(value)} className="topbar-tab">{value[0].toUpperCase() + value.slice(1)}</AriaButton>)}</nav>
    <div className="topbar-actions">
      <Button variant="secondary" leadingIcon={RiSearchLine} className="search-trigger" onClick={onSearch} aria-label="Search the archive"><span>Search the archive</span><kbd><RiCommandLine aria-hidden />K</kbd></Button>
      <IconButton icon={theme === "light" ? RiMoonLine : RiSunLine} aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`} onClick={onThemeToggle} />
      <Button leadingIcon={RiAddLine} className="header-save" onClick={onSave} aria-label="Save" disabled={saveDisabled}>Save</Button>
    </div>
  </header>;
}

export function MobileNav({ section, onSectionChange, onSave, saveDisabled }: {
  section: AppSection; onSectionChange: (section: AppSection) => void; onSave: () => void; saveDisabled: boolean;
}) {
  return <nav className="mobile-nav" aria-label="Mobile navigation">
    {(["overview", "inbox", "save", "products", "reading"] as const).map((value) => value === "save"
      ? <Button key={value} iconOnly leadingIcon={RiAddLine} className="mobile-save" onClick={onSave} aria-label="Quick save" disabled={saveDisabled} />
      : <AriaButton key={value} aria-current={section === value ? "page" : undefined} onPress={() => onSectionChange(value)} className="mobile-nav-item"><NavIcon section={value} />{value[0].toUpperCase() + value.slice(1)}</AriaButton>)}
  </nav>;
}
