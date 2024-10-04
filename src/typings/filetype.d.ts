export type FileType = {
  id: string;
  filename: string;
  fullName: string;
  timestamp: Date;
  downloadUrl: string;
  type: string;
  size: number;
  unstructuredFile: string;
  summary: string;
  tags: string[];
  folderId?: string;
  deletedAt: Date | null;
  uploadedToRagie: boolean;
  ragieFileId: string | null;
};
