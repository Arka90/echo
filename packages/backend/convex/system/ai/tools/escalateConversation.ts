import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgents";

export const EscalateConversation = createTool({
  description: "Escalate a conversation ",
  args: z.object({}),
  handler: async (ctx) => {
    if (!ctx.threadId) {
      return "Missing threadId in context";
    }

    await ctx.runMutation(internal.system.conversations.escalate, {
      threadId: ctx.threadId,
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "The conversation escalated to a human operator.",
      },
    });

    return "Conversation escalated for human operator.";
  },
});
