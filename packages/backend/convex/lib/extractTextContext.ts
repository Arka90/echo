import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
  image: openai("gpt-4o-mini"),
  pdf: openai("gpt-4o"),
  html: openai("gpt-4o"),
} as const;

const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

const SYSTEM_PROMPTS = {
  image:
    "You turn images into text. If it is a photo of a document, transcribe the text. If not, describe in detail.",
  pdf: "You transform PDF documents into text.",
  html: "You transform HTML documents into markdown.",
};

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  mimeType: string;
  fileName: string;
  bytes?: ArrayBuffer;
};

async function extractImageText(url: string): Promise<string> {
  const response = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    messages: [
      {
        role: "user",
        content: [{ type: "image", image: new URL(url) }],
      },
    ],
  });
  return response.text;
}

async function extractPdfText(
  url: string,
  mimeType: string,
  filename: string
): Promise<string> {
  const response = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    messages: [
      {
        role: "user",
        content: [
          { type: "file", data: new URL(url), mimeType, filename },
          {
            type: "text",
            text: "Extract all the text from this document.",
          },
        ],
      },
    ],
  });
  return response.text;
}

async function extractTextFileContent(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
  mimeType: string
): Promise<string> {
  const arrayBuffer =
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());

  if (!arrayBuffer) {
    throw new Error("Failed to get file content");
  }

  const text = new TextDecoder().decode(arrayBuffer);

  if (mimeType.toLocaleLowerCase() !== "text/plain") {
    const response = await generateText({
      model: AI_MODELS.html,
      system: SYSTEM_PROMPTS.html,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text },
            {
              type: "text",
              text: `Extract all the text from this ${mimeType} document and convert it to markdown.`,
            },
          ],
        },
      ],
    });

    return response.text;
  }

  return text;
}
export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { storageId, mimeType, fileName, bytes } = args;
  const url = await ctx.storage.getUrl(storageId);
  assert(url, "Failed to get storage URL");

  if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
    return extractImageText(url);
  }

  if (mimeType.toLocaleLowerCase().includes("pdf")) {
    return extractPdfText(url, mimeType, fileName);
  }

  if (mimeType.toLocaleLowerCase().includes("text")) {
    return extractTextFileContent(ctx, storageId, bytes, mimeType);
  }

  throw new Error(`Unsupported mime type: ${mimeType}`);
}
