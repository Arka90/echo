"use client";
import { Button } from "@workspace/ui/components/button";
import { add } from "@workspace/math/add";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getMany);
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello apps/page</h1>
        <p className="text-lg">2 + 3 = {add(2, 3)}</p>
        <Button size="sm">Button</Button>
        {JSON.stringify(users) || "Loading users..."}
      </div>
    </div>
  );
}
