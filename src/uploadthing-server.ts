import { createUploadthing, type FileRouter } from "uploadthing/server";
import admin from "firebase-admin";

const f = createUploadthing();

// Initialize Firebase Admin
// IMPORTANT: Replace the placeholder below with your actual Firebase service account key.
// You can get this from the Firebase console: Project settings > Service accounts > Generate new private key
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://minichat-03097761-de523-default-rtdb.firebaseio.com"
  });
}


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const token = req.headers.get("authorization")?.split(" ")[1] ?? "";
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;
        return { userId: uid };
      } catch (error) {
        throw new Error("Unauthorized");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
