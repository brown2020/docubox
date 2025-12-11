/**
 * Color mapping for file extension labels.
 */
export const COLOR_EXTENSION_MAP: Record<string, string> = {
  pdf: "#0160fe",
  docx: "#2b579a",
  doc: "#2b579a",
  ppt: "#b7472a",
  pptx: "#b7472a",
  xls: "#217346",
  xlsx: "#217346",
  jpg: "#d4af37",
  jpeg: "#d4af37",
  png: "#4fb6f4",
  gif: "#d4af37",
  txt: "#000000",
  zip: "#000000",
  rar: "#000000",
  msg: "#81D4FA",
  eml: "#81D4FA",
};

/**
 * Mapping for uncommon MIME type extensions to standard extensions.
 */
export const UNCOMMON_EXTENSIONS_MAP: Record<string, string> = {
  "vnd.ms-outlook": "msg",
  rfc822: "eml",
  "svg+xml": "svg",
};
