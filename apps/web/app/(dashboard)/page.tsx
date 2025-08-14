"use client";

import { Button } from "@workspace/ui/components/button";
import { add } from "@workspace/math/add";
import { useQuery } from "convex/react";
import { OrganizationSwitcher, SignInButton, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getMany);
  return (
    <>
      <div className="min-h-svh">
        <div className="flex justify-end p-4">
          <UserButton />
        </div>
        <OrganizationSwitcher hidePersonal={true} />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center space-y-4">
            <p className="text-lg">2 + 3 = {add(2, 3)}</p>
            <Button size="sm">Button</Button>
            {users ? (
              <ul className="mt-4 space-y-1">
                {users.map((user) => (
                  <li key={user._id} className="text-sm">
                    {user.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">Loading users...</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-svh">
        <div className="text-center">
          <p className="text-lg mb-4">Please log in to see the result.</p>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </div>
    </>
  );
}
