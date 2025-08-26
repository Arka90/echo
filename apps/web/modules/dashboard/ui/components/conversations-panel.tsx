"use client";
import { getCountryFlagUrl, getCountryFromTimeZone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { usePaginatedQuery } from "convex/react";
import {
  ListIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CornerUpLeftIcon,
  CheckIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { useAtom } from "jotai";
import { statusFilterAtom } from "../../atom";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";

export const ConverSationPanel = () => {
  const pathName = usePathname();
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);
  const conversation = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    { initialNumItems: 10 }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: conversation.status,
    loadMore: conversation.loadMore,
    loadSize: 10,
  });

  return (
    <div className="flex h-full w-full flex-col bg-background text-sidebar-foreground">
      <div className="flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) => {
            setStatusFilter(value as "unresolved" | "resolved" | "escalated");
          }}
          value={statusFilter}
        >
          <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="Filter" />
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <ListIcon className="size-4" />
                  <span>All</span>
                </div>
              </SelectItem>
              <SelectItem value="unresolved">
                <div className="flex items-center gap-2">
                  <ArrowRightIcon className="size-4" />
                  <span>Unresolved</span>
                </div>
              </SelectItem>
              <SelectItem value="escalated">
                <div className="flex items-center gap-2">
                  <ArrowUpIcon className="size-4" />
                  <span>Escalated</span>
                </div>
              </SelectItem>
              <SelectItem value="resolved">
                <div className="flex items-center gap-2">
                  <CheckIcon className="size-4" />
                  <span>Escalated</span>
                </div>
              </SelectItem>
            </SelectContent>
          </SelectTrigger>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <SkeletonConversation />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-53px)]">
          <div className="flex w-full flex-col text-sm">
            {conversation.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role !== "user";
              const country = getCountryFromTimeZone(
                conversation.contactSession.metadata?.timezone || ""
              );
              const countryFlagUrl = country?.code
                ? getCountryFlagUrl(country.code)
                : undefined;
              return (
                <Link
                  key={conversation._id}
                  href={`/conversations/${conversation._id}`}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                    pathName === `/conversations/${conversation._id}` &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "-translate-y-1/2 absolute left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                      pathName === `/conversations/${conversation._id}` &&
                        "opacity-100"
                    )}
                  />
                  <DicebearAvatar
                    seed={conversation.contactSessionId}
                    badgeImageUrl={countryFlagUrl}
                    size={40}
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex w-full items-center gap-2">
                      <span className="truncate font-bold">
                        {conversation.contactSession.name}
                      </span>
                      <span className="ml-auto shrink-0 text-muted-foreground text-xs">
                        {formatDistanceToNow(conversation._creationTime)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex w-0 grow items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "line-clamp-1 text-muted-foreground text-xs",
                            !isLastMessageFromOperator && "font-bold text-black"
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              ref={topElementRef}
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore || isLoadingFirstPage}
              onLoadMore={handleLoadMore}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export const SkeletonConversation = () => {
  return (
    <ScrollArea className="max-h-[calc(100vh-53px)]">
      <div className="flex w-full flex-col text-sm">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="relative flex cursor-pointer items-center gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground"
          >
            {/* Active indicator skeleton */}
            <div className="absolute left-0 h-[64%] w-1 rounded-r-full bg-neutral-200 opacity-0" />

            {/* Avatar skeleton */}
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-neutral-200" />

            <div className="flex-1">
              {/* Name and time skeleton */}
              <div className="flex w-full items-center gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                <div className="ml-auto h-3 w-12 shrink-0 animate-pulse rounded bg-neutral-200" />
              </div>

              {/* Message and status skeleton */}
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex w-0 grow items-center gap-1">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
                </div>
                <div className="h-4 w-4 animate-pulse rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
