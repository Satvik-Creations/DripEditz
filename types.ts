
export interface GeneratedContentPart {
  text?: string;
  imageUrl?: string;
}

export interface ImageFile {
  file: File;
  base64: string;
  mimeType: string;
  previewUrl: string;
}
