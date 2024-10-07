export type FileType = {
  docId: string;
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
  isUploadedToRagie: boolean;
  ragieFileId: string | null;
};
