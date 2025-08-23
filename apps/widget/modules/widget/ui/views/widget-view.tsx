"use client";
import { useAtomValue } from "jotai";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { screenAtom } from "../../atoms/widget-atoms";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";
import { WidgetSelectionScreen } from "../screens/widget-selection-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";
import { WidgetInboxScreen } from "../screens/widget-inbox-screen";

interface Props {
  organizationId: string;
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom);

  const screenComponents = {
    error: () => <WidgetErrorScreen />,
    loading: () => <WidgetLoadingScreen organizationId={organizationId} />,
    auth: () => <WidgetAuthScreen />,
    chat: () => <WidgetChatScreen />,
    voice: () => <div>Voice Screen</div>,
    contact: () => <div>Contact Screen</div>,
    inbox: () => <WidgetInboxScreen />,
    selection: () => <WidgetSelectionScreen />,
  };

  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]()}
    </main>
  );
};
