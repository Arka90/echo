"use client";

import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";

import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";

import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { ConversationStatusButton } from "../components/conversation-status-button";
import { useState } from "react";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  const createMessage = useMutation(api.private.messages.createMessage);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation?.threadId } : "skip",
    { initialNumItems: 20 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    });

  const updateStatus = useMutation(api.private.conversations.updateStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleStatus = async () => {
    if (!conversation) return;
    setIsUpdatingStatus(true);

    let newStatus: "unresolved" | "resolved" | "escalated";

    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved";
    } else {
      newStatus = "unresolved";
    }

    try {
      await updateStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const enhanceResponse = useAction(api.private.messages.enhanceResponse);

  const [enhancing, setEnhancing] = useState(false);
  const handleEnhanceResponse = async () => {
    const currentValue = form.getValues("message");
    try {
      setEnhancing(true);
      const enhancedText = await enhanceResponse({ prompt: currentValue });
      form.setValue("message", enhancedText);
    } catch (error) {
      console.error("Enhance response error:", error);
    } finally {
      setEnhancing(false);
    }
  };

  if (conversation === undefined || messages.status === "LoadingFirstPage") {
    return <ConversationIdViewLoading />;
  }

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button variant="ghost" size="sm">
          <MoreHorizontalIcon />
        </Button>
        {!!conversation && (
          <ConversationStatusButton
            onClick={handleToggleStatus}
            status={conversation?.status}
            disabled={isUpdatingStatus}
          />
        )}
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => {
            return (
              <AIMessage
                from={message.role === "user" ? "assistant" : "user"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>{message.content}</AIResponse>
                </AIMessageContent>
                {message.role === "user" && (
                  <DicebearAvatar
                    seed={conversation?.contactSessionId ?? "user"}
                    size={32}
                  />
                )}
              </AIMessage>
            );
          })}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="p-2">
        <Form {...form}>
          <AIInput onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="message"
              control={form.control}
              disabled={
                conversation?.status === "resolved" || enhancing || isSubmitting
              }
              render={({ field }) => (
                <AIInputTextarea
                  disabled={conversation?.status === "resolved" || isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved"
                      : "Type your response as an operator..."
                  }
                  {...field}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton
                  disabled={
                    conversation?.status === "resolved" ||
                    enhancing ||
                    !form.formState.isValid
                  }
                  variant="ghost"
                  size="icon"
                  onClick={handleEnhanceResponse}
                >
                  <Wand2Icon />
                  {enhancing ? "Enhancing..." : "Enhance"}
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  isSubmitting ||
                  !form.formState.isValid ||
                  enhancing
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};

export const ConversationIdViewLoading = () => {
  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button variant="ghost" size="sm" disabled>
          <MoreHorizontalIcon className="opacity-20" />
        </Button>
        <div className="h-8 w-24 rounded-md bg-gray-300 animate-pulse" />
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {[...Array(5)].map((_, i) => (
            <AIMessage from={i % 2 === 0 ? "assistant" : "user"} key={i}>
              <AIMessageContent>
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="h-4 w-full max-w-xs bg-gray-300 rounded animate-pulse" />
                  <div className="h-4 w-full max-w-sm bg-gray-300 rounded animate-pulse" />
                  {i % 3 === 0 && (
                    <div className="h-4 w-full max-w-md bg-gray-300 rounded animate-pulse" />
                  )}
                </div>
              </AIMessageContent>
              {i % 2 !== 0 && (
                <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="p-2">
        <div className="space-y-2">
          <div className="min-h-[80px] w-full bg-gray-300 rounded-md animate-pulse" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
