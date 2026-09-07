"use client";

import type { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { cx } from "@/utils/cx";

/** AMBAR composition of React Aria mechanics and BoardUI panel/selection recipes. */
export function ArchiveDialog({ open, onClose, ariaLabel, children, className, placement = "center" }: {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  placement?: "center" | "right" | "left";
}) {
  return (
    <ModalOverlay isOpen={open} onOpenChange={(value) => { if (!value) onClose(); }} isDismissable className={cx("archive-overlay", placement !== "center" && `archive-overlay-${placement}`)}>
      <Modal className={cx("archive-modal", placement !== "center" && "archive-sheet", className)}>
        <Dialog aria-label={ariaLabel} className="archive-dialog">{children}</Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export function DetailTabs({ details, activity, activityLabel }: { details: ReactNode; activity: ReactNode; activityLabel: string }) {
  return (
    <Tabs className="detail-tabs">
      <TabList aria-label="Item detail sections" className="detail-tab-list">
        <Tab id="details" className="detail-tab">Details</Tab>
        <Tab id="activity" className="detail-tab">{activityLabel}</Tab>
      </TabList>
      <TabPanel id="details" className="detail-tab-panel">{details}</TabPanel>
      <TabPanel id="activity" className="detail-tab-panel">{activity}</TabPanel>
    </Tabs>
  );
}
