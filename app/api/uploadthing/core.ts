import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

// Auth helper extracting userId from JWT cookie (aligned with existing actions logic)
async function auth(req: Request) {
  try {
    const { cookies } = await import("next/headers");
    const { JWTAuth } = await import("@/lib/auth/jwt");
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return null;
    const payload = await JWTAuth.verifyAccessToken(accessToken);
    const userId = (payload as any)?.userId || (payload as any)?.sub;
    return userId ? { id: userId } : null;
  } catch {
    return null;
  }
}

const f = createUploadthing();

export const ourFileRouter = {
  avatarImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Persist avatar URL to DB
      try {
        const { db } = await import("@/lib/db/db");
        const { users } = await import("@/lib/db/schema");
        const { eq } = await import("drizzle-orm");
        await db
          .update(users)
          .set({ profileImage: file.ufsUrl, updatedAt: new Date() })
          .where(eq(users.id, metadata.userId));
      } catch (e) {
        console.error("Failed to persist avatar URL", e);
      }
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
