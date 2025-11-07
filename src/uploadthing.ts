import { createUploadthing } from "@uploadthing/react";
import type { OurFileRouter } from "@/uploadthing-server";
 
export const { UploadButton, UploadDropzone, Uploader } = createUploadthing<OurFileRouter>();