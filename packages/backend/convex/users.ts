import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all users from the database
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const add = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    // Add a new user to the database
    const user = await ctx.db.insert("users", { name });
    return user;
  },
});
