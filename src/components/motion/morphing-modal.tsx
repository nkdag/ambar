"use client";
// beui.dev/components/motion/morphing-modal

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface MorphingModalProps {
  /** Which view is currently shown. `null` closes the modal. */
  viewId: string | null;
  onClose: () => void;
  children: ReactNode;
  /** "bottom" anchors to the viewport bottom (mobile-like). "center" centers vertically. */
  placement?: "bottom" | "center";
  className?: string;
  ariaLabel?: string;
}

export function MorphingModal({
  viewId,
  onClose,
  children,
  placement = "bottom",
  className,
  ariaLabel = "Dialog",
}: MorphingModalProps) {
  const open = viewId !== null;
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const enterY = reduce ? 0 : placement === "bottom" ? 40 : 20;
  const enterScale = reduce ? 1 : 0.97;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(
          "[data-autofocus], input, button, select, textarea, a[href]",
        )
        ?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose, open]);

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-0 z-[80]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <motion.button
        type="button"
        aria-label="Close modal"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[#141311]/65",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex justify-center px-4",
          placement === "bottom" ? "items-end pb-8" : "items-center",
        )}
      >
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              ref={panelRef}
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              layout
              initial={{ opacity: 0, y: enterY, scale: enterScale }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: enterY,
                scale: reduce ? 1 : 0.98,
                transition: { duration: 0.18, ease: EASE_OUT },
              }}
              transition={reduce ? { duration: 0.01 } : SPRING_PANEL}
              className={cn(
                "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-background shadow-2xl will-change-transform",
                className,
              )}
            >
              <motion.div layout="position" className="p-5">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={viewId}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 8, filter: "blur(4px)" }
                    }
                    animate={
                      reduce
                        ? {
                            opacity: 1,
                            transition: {
                              duration: 0.18,
                              ease: EASE_OUT,
                            },
                          }
                        : {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: {
                              duration: 0.24,
                              ease: EASE_OUT,
                            },
                          }
                    }
                    exit={
                      reduce
                        ? {
                            opacity: 0,
                            transition: {
                              duration: 0.14,
                              ease: EASE_OUT,
                            },
                          }
                        : {
                            opacity: 0,
                            y: -8,
                            filter: "blur(4px)",
                            transition: {
                              duration: 0.16,
                              ease: EASE_OUT,
                            },
                          }
                    }
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
