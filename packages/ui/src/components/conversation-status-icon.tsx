import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ConversationStatusIconProps {
  status: "unresolved" | "escalated" | "resolved";
}

const statusConfig = {
  resolved: {
    icon: CheckIcon,
    bgColor: "bg-[#3fb62f]",
  },
  escalated: {
    icon: ArrowUpIcon,
    bgColor: "bg-yellow-500",
  },
  unresolved: {
    icon: ArrowRightIcon,
    bgColor: "bg-destructive",
  },
} as const;

export const ConversationStatusIcon = ({
  status,
}: ConversationStatusIconProps) => {
  const Icon = statusConfig[status].icon;
  const config = statusConfig[status];
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full p-1.5 ",
        config.bgColor
      )}
    >
      <Icon className="size-3 stroke-3 text-white" />
    </div>
  );
};
