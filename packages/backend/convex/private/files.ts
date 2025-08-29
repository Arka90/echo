import { ConvexError, v } from "convex/values";
import {
  contentHashFromArrayBuffer,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntry,
} from "@convex-dev/rag";
import { action, mutation } from "../_generated/server";
import { extractTextContent } from "../lib/extractTextContext";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";

function guessMimeType(fileName: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(fileName) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  );
}

export const deleteFile = mutation({
  args: {
    entryId: vEntry,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization ID not found in identity",
      });
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Namespace",
      });
    }

    const entry = await rag.getEntry(ctx, args.entryId);

    if (!entry) {
      throw new ConvexError({
        code: "not_found",
        message: "Entry not found",
      });
    }

    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You do not have permission to delete this file",
      });
    }

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
    }

    await rag.deleteAsync(ctx, args.entryId);
  },
});

export const addFile = action({
  args: {
    fileName: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization ID not found in identity",
      });
    }

    const { fileName, bytes, category } = args;
    const mimeType = args.mimeType || guessMimeType(fileName, bytes);

    const blob = new Blob([bytes], { type: mimeType });
    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      mimeType,
      fileName,
      bytes,
    });

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text,
      key: fileName,
      metadata: {
        storageId,
        uploadedBy: orgId,
        fileName,
        category: category ?? null,
      },
      contentHash: await contentHashFromArrayBuffer(bytes),
    });

    if (!created) {
      console.debug("Entry already exists, skipping upload metadata");
      await ctx.storage.delete(storageId);
    }
    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});
