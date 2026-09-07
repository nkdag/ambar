"use client";

import { useEffect, useEffectEvent, useSyncExternalStore, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "@remixicon/react";
import { CloseButton } from "@/components/base/buttons/close-button";
import { cx } from "@/utils/cx";

/** BoardUI free Notification, narrowed to AMBAR's existing save feedback.
 * Original card/status/type/close recipes retained; unused avatar/actions and
 * Motion effects removed. The caller owns lifetime; no nonessential motion.
 * MIT provenance: licenses/BoardUI-MIT.txt and styles/BOARDUI_SOURCE.json.
 */
export function Notification({ title, description, status, onDismiss, autoDismissDuration = 4200 }: {
  title: string;
  description?: string;
  status: "success" | "error";
  onDismiss: () => void;
  autoDismissDuration?: number;
}) {
  const dismiss = useEffectEvent(onDismiss);
  useEffect(() => {
    if (autoDismissDuration <= 0) return;
    const timer = window.setTimeout(() => dismiss(), autoDismissDuration);
    return () => window.clearTimeout(timer);
  }, [autoDismissDuration]);
  const Icon = status === "error" ? RiErrorWarningFill : RiCheckboxCircleFill;
  return (
    <div role={status === "error" ? "alert" : "status"} className="relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default p-4 pr-14 shadow-dropdown">
      <span className={cx("relative flex size-10 shrink-0 items-center justify-center rounded-full", status === "error" ? "bg-notification-error-background text-notification-error-foreground" : "bg-notification-success-background text-notification-success-foreground")}><Icon className="size-5" aria-hidden /></span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 break-words"><p className="text-body-medium text-text-primary">{title}</p>{description && <p className="text-body-regular text-text-secondary">{description}</p>}</div>
      <CloseButton aria-label="Dismiss notification" onClick={onDismiss} className="absolute top-3 right-3" />
    </div>
  );
}

const subscribe = () => () => {};
export function NotificationViewport({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<div data-react-aria-top-layer role="region" aria-label="Notifications" className={cx("pointer-events-none fixed right-3 bottom-3 z-100 flex w-[min(400px,calc(100vw-24px))] flex-col gap-3 sm:right-6 sm:bottom-6 [&>*]:pointer-events-auto", className)} {...props}>{children}</div>, document.body);
}
