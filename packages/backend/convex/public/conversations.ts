import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";

export const getOne = query({
  args: {
    conversationId: v.id("conversations"),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired contact session",
      });
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    return {
      _id: conversation._id,
      threadId: conversation.threadId,
      status: conversation.status,
    };
  },
});

export const create = mutation({
  args: {
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired contact session",
      });
    }
    // TODO: Validate organizationId if necessary
    const threadId = "123";
    const conversationId = await ctx.db.insert("conversations", {
      threadId,
      organizationId: args.organizationId,
      contactSessionId: args.contactSessionId,
      status: "unresolved",
    });

    return conversationId;
  },
});
