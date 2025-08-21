import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Define your schema here

  conversations: defineTable({
    threadId: v.string(),
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_threadId", ["threadId"])
    .index("by_contactSessionId", ["contactSessionId"])
    .index("by_status_and_organizationId", ["status", "organizationId"]),

  contactSessions: defineTable({
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    expiresAt: v.number(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.string()),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timeOffset: v.optional(v.number()),
        cookieEnabled: v.optional(v.boolean()),
        referer: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  })
    .index("by_expiresAt", ["expiresAt"])
    .index("by_organizationId", ["organizationId"]),

  users: defineTable({
    name: v.string(),
  }),
});
