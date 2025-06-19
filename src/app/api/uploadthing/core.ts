import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;

      // Delete old avatar if it exists
      if (oldAvatarUrl) {
        try {
          // Extract file key from URL for v7 deletion
          const urlParts = oldAvatarUrl.split('/');
          const key = urlParts[urlParts.length - 1];
          
          if (key) {
            await new UTApi().deleteFiles(key);
          }
        } catch (error) {
          console.error("Failed to delete old avatar:", error);
        }
      }

      // In v7, use file.url directly without URL manipulation
      const newAvatarUrl = file.url;

      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: {
            avatarUrl: newAvatarUrl,
          },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);

      return { avatarUrl: newAvatarUrl };
    }),
    
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id }; // Return userId for potential use
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("File uploaded:", file.url);
        const media = await prisma.media.create({
          data: {
            // In v7, use file.url directly without URL manipulation
            url: file.url,
            type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
          },
        });
        return { mediaId: media.id };
      } catch (error) {
        console.error("[UPLOADTHING ERROR] Failed to save media:", error);
        throw new UploadThingError("Failed to save media: " + (error instanceof Error ? error.message : String(error)));
      }
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
