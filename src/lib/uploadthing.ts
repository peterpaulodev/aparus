import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { UTApi } from "uploadthing/server";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export const utapi = new UTApi();

/**
 * Extrai a chave do arquivo (File Key) a partir da URL do UploadThing.
 * Ex: https://utfs.io/f/minha-chave-123.png -> minha-chave-123.png
 */
export function extractFileKey(url: string) {
  if (!url.includes("utfs.io")) return null;

  const parts = url.split("/f/");
  return parts.length > 1 ? parts[1] : null;
}