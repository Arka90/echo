import { ConversationsLayout } from "@/modules/dashboard/ui/layouts/conversations-layout";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <ConversationsLayout>{children}</ConversationsLayout>;
};

export default layout;
