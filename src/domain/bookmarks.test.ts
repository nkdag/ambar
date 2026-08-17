import { describe, expect, it } from "vitest";
import { parseChromeBookmarks } from "./bookmarks";

const chromeExport = String.raw`<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3>Studio references</H3>
  <DL><p>
    <DT><A HREF="https://www.architectural-review.com/essays/archive-rooms" ADD_DATE="1786896000">Archive rooms &amp; working memory</A>
    <DT><A HREF="https://example.org/tool-roll" ADD_DATE="1786809600"><b>Canvas tool roll</b></A>
    <DT><A HREF="javascript:window.__unsafe = true" ONCLICK="window.__unsafe = true">Unsafe bookmark</A>
    <SCRIPT>window.__unsafe = true</SCRIPT>
  </DL><p>
</DL><p>`;

describe("parseChromeBookmarks", () => {
  it("returns plain records from Chrome bookmark HTML", () => {
    const result = parseChromeBookmarks(chromeExport);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      title: "Archive rooms & working memory",
      url: "https://www.architectural-review.com/essays/archive-rooms",
      folder: "Studio references",
      site: "architectural-review.com",
    });
    expect(result[0].addedAt).toBe("2026-08-16T16:00:00.000Z");
    expect(result[1].title).toBe("Canvas tool roll");
  });

  it("drops executable protocols and never returns markup or handler data", () => {
    const result = parseChromeBookmarks(chromeExport);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("javascript:");
    expect(serialized).not.toContain("ONCLICK");
    expect(serialized).not.toContain("<b>");
    expect((globalThis as typeof globalThis & { __unsafe?: boolean }).__unsafe).toBeUndefined();
  });

  it("returns an empty preview for malformed content without throwing", () => {
    expect(parseChromeBookmarks("this is not a bookmark export")).toEqual([]);
  });
});
