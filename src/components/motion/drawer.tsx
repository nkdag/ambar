"use client";
// beui.dev/components/motion/drawer

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  children: ReactNode;
  /** Class for the panel surface. */
  className?: string;
  /** Class for the backdrop. */
  backdropClassName?: string;
  ariaLabel?: string;
  /** Close when the backdrop is clicked. Default true. */
  dismissable?: boolean;
}

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
  backdropClassName,
  ariaLabel,
  dismissable = true,
}: DrawerProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("[data-autofocus], button, input, a[href]")
        ?.focus();
    });
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onOpenChange]);

  const offscreen = side === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={dismissable ? 0 : -1}
            onClick={() => dismissable && onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className={cn(
              "absolute inset-0 h-full w-full cursor-default bg-[#141311]/60",
              backdropClassName,
            )}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={reduce ? { opacity: 0 } : { x: offscreen }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: offscreen }}
            transition={reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING_PANEL}
            className={cn(
              "absolute inset-y-0 flex w-80 max-w-[85vw] flex-col bg-background shadow-2xl",
              side === "right"
                ? "right-0 border-l border-border"
                : "left-0 border-r border-border",
              className,
            )}
          >
            {children}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
