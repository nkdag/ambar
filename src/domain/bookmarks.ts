import { safeWebUrl } from "./archive";

export interface ChromeBookmarkPreview {
  title: string;
  url: string;
  site: string;
  folder: string;
  addedAt?: string;
}

function addedAtFromChromeTimestamp(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const timestamp = Number(value) * 1000;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function nearestFolder(anchor: HTMLAnchorElement) {
  let node: Element | null = anchor.parentElement;

  while (node) {
    if (node.tagName === "DL") {
      let sibling = node.previousElementSibling;
      while (sibling) {
        const heading =
          sibling.tagName === "H3" ? sibling : sibling.querySelector("h3");
        if (heading?.textContent?.trim()) return heading.textContent.trim();
        sibling = sibling.previousElementSibling;
      }

      const parentHeading = node.parentElement?.querySelector(":scope > h3");
      if (parentHeading?.textContent?.trim()) {
        return parentHeading.textContent.trim();
      }
    }
    node = node.parentElement;
  }

  return "Imported bookmarks";
}

export function parseChromeBookmarks(html: string): ChromeBookmarkPreview[] {
  if (!html.trim() || typeof DOMParser === "undefined") return [];

  try {
    const document = new DOMParser().parseFromString(html, "text/html");

    return Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).flatMap(
      (anchor) => {
        const parsedUrl = safeWebUrl(anchor.getAttribute("href") ?? "");
        const title = anchor.textContent?.replace(/\s+/g, " ").trim();
        if (!parsedUrl || !title) return [];

        const addedAt = addedAtFromChromeTimestamp(
          anchor.getAttribute("add_date"),
        );

        return [
          {
            title,
            url: parsedUrl.toString(),
            site: parsedUrl.hostname.replace(/^www\./, ""),
            folder: nearestFolder(anchor),
            ...(addedAt ? { addedAt } : {}),
          },
        ];
      },
    );
  } catch {
    return [];
  }
}
