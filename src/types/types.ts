/**
 * Metadata for parsed document elements from Unstructured API.
 */
export interface Metadata {
  filetype: string;
  languages: string[];
  page_number: number;
  filename: string;
  parent_id?: string;
  email_message_id?: string;
  sent_from?: string[];
  sent_to?: string[];
  subject?: string;
}

/**
 * Element types returned by Unstructured API.
 */
export type ElementType =
  | "Title"
  | "NarrativeText"
  | "EmailAddress"
  | "UncategorizedText"
  | "PageNumber"
  | "Image"
  | "Heading"
  | "Header"
  | "Table"
  | "Footer";

/**
 * A single element from a parsed document.
 */
export interface Element {
  type: ElementType;
  element_id: string;
  text: string;
  metadata: Metadata;
}

/**
 * A chunk of document content, grouped by heading.
 */
export interface Chunk {
  heading: string | null;
  content: Element[];
}
