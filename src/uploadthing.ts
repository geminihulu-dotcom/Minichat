import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing-server";
 
export const UploadButton = generateUploadButton<OurFileRouter>({
  url: "http://localhost:3000/api/uploadthing",
});
