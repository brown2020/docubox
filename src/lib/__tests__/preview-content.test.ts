import { describe, expect, it } from "vitest";
import {
  previewContentDisposition,
  previewContentType,
  sliceByteRange,
} from "@/lib/preview-content";

describe("previewContentType", () => {
  it("serves html and unknown types as plain text", () => {
    expect(previewContentType("text/html", "page.html")).toBe("text/plain; charset=utf-8");
    expect(previewContentType("application/xhtml+xml", "page.xhtml")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(previewContentType("text/plain; charset=utf-8", "notes.txt")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(previewContentType("", "mystery.bin")).toBe("application/octet-stream");
  });

  it("keeps image and pdf types the browser can render", () => {
    expect(previewContentType("image/jpeg", "scan.jpg")).toBe("image/jpeg");
    expect(previewContentType("image/jpg", "scan.jpg")).toBe("image/jpeg");
    expect(previewContentType("application/pdf", "doc.pdf")).toBe("application/pdf");
    expect(previewContentType("image/svg+xml", "icon.svg")).toBe("image/svg+xml");
  });
});

describe("previewContentDisposition", () => {
  it("strips quotes and non-ascii from the filename", () => {
    expect(previewContentDisposition('notes"\r\n.txt')).toBe('inline; filename="notes.txt"');
    expect(previewContentDisposition("")).toBe('inline; filename="file"');
  });
});

describe("sliceByteRange", () => {
  const bytes = new Uint8Array([0, 1, 2, 3, 4]);

  it("returns the whole body when no range is requested", () => {
    expect(sliceByteRange(bytes, null)).toEqual({ status: 200, body: bytes });
  });

  it("returns the requested byte range", () => {
    const ranged = sliceByteRange(bytes, "bytes=1-3");
    expect(ranged.status).toBe(206);
    expect(Array.from(ranged.body)).toEqual([1, 2, 3]);
    expect(ranged.contentRange).toBe("bytes 1-3/5");
  });
});
