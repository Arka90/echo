import { openai } from "@ai-sdk/openai";
import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgents";
import rag from "../rag";
import { threadId } from "worker_threads";
import { SEARCH_INTERPRETER_PROMPT } from "../contants";

export const search = createTool({
  description:
    "Search the knowledge base for relevant information to help answer user questions.",
  args: z.object({
    query: z.string().describe("The question to search for."),
  }),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      return "No thread ID found in context.";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId }
    );

    if (!conversation) {
      return "No conversation found for this thread ID.";
    }

    const orgId = conversation.organizationId;
    const searchResults = await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });

    const contextText = `Found results in ${searchResults.entries
      .map((e) => e.title || null)
      .filter((t) => t)
      .join(", ")}. Here is the relevant information:\n\n${searchResults.text}`;

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${args.query}"\n\nSearch results:${contextText}`,
        },
      ],
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: response.text,
      },
    });

    return response.text;
  },
});
