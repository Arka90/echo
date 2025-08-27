import { ConvexError, v } from "convex/values";
import { generateText } from "ai";
import { action, mutation, query } from "../_generated/server";
import { components } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgents";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";

export const enhanceResponse = action({
  args: {
    prompt: v.string(),
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

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that improves customer support responses to be more empathetic and solution-oriented but keeping the operator's text meaning.",
        },
        {
          role: "user",
          content: args.prompt,
        },
      ],
    });

    return response.text;
  },
});

export const createMessage = mutation({
  args: {
    prompt: v.string(),
    conversationId: v.id("conversations"),
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

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found.",
      });
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You do not have access to this conversation.",
      });
    }

    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation is resolved.",
      });
    }

    // TODO: Implement subscription plan check here.

    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: identity.familyName,
      message: {
        role: "assistant",
        content: args.prompt,
      },
    });
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
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

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found.",
      });
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You do not have access to this conversation.",
      });
    }
    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    return paginated;
  },
});
