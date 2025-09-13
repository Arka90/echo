import { VapiClient, Vapi } from "@vapi-ai/server-sdk";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getSecretValue, parseSecretString } from "../lib/secrets";
import { ConvexError } from "convex/values";

export const getAssistants = action({
  args: {},
  handler: async (ctx, args): Promise<Vapi.Assistant[]> => {
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

    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      {
        organizationId: orgId,
        service: "vapi",
      }
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Vapi plugin not found for organization",
      });
    }
    const secretName = plugin.secretName;
    const secretValue = await getSecretValue(secretName);
    const secretData = parseSecretString<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secretValue);

    if (!secretData) {
      throw new ConvexError({
        code: "INTERNAL",
        message: "Credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "INTERNAL",
        message: "Credentials are incomplete. Please reconnect Vapi.",
      });
    }
    const vapiClient = new VapiClient({
      token: secretData.privateApiKey,
    });
    const assistants = await vapiClient.assistants.list();

    return assistants;
  },
});

export const getPhoneNumber = action({
  args: {},
  handler: async (ctx, args): Promise<Vapi.PhoneNumbersListResponseItem[]> => {
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

    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      {
        organizationId: orgId,
        service: "vapi",
      }
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Vapi plugin not found for organization",
      });
    }
    const secretName = plugin.secretName;
    const secretValue = await getSecretValue(secretName);
    const secretData = parseSecretString<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secretValue);

    if (!secretData) {
      throw new ConvexError({
        code: "INTERNAL",
        message: "Credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "INTERNAL",
        message: "Credentials are incomplete. Please reconnect Vapi.",
      });
    }
    const vapiClient = new VapiClient({
      token: secretData.privateApiKey,
    });
    const phoneNumbers = await vapiClient.phoneNumbers.list();

    return phoneNumbers;
  },
});
