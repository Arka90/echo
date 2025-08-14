"use client";
import { Button } from "@workspace/ui/components/button";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useVapi } from "@/modules/widget/hooks/use-vapi";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
    startCall,
    endCall,
  } = useVapi();
  return (
    <div className="flex items-center justify-center min-h-svh">
      <Button onClick={() => startCall()} size="sm">
        Start Call
      </Button>
      <Button onClick={() => endCall()} size="sm" variant="destructive">
        End Call
      </Button>
      <p>isConnected {`${isConnected}`}</p>
      <p>isConnecting {`${isConnecting}`}</p>
      <p>isSpeaking {`${isSpeaking}`}</p>
      <p>{JSON.stringify(transcript, null, 2)}</p>
    </div>
  );
}
