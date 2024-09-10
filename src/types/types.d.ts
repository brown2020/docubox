// types.ts
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
  
  export interface Element {
    type:
      | "Title"
      | "NarrativeText"
      | "EmailAddress"
      | "UncategorizedText"
      | "PageNumber"
      | "Image"
      | "Heading"
      | "Date"
    element_id: string;
    text: string;
    metadata: Metadata;
  }
  
  export interface Chunk {
    heading: string | null;
    content: Element[];
  }
  