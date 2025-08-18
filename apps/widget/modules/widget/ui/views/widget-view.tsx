"use client";
import { useAtomValue } from "jotai";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { screenAtom } from "../../atoms/widget-atoms";

interface Props {
  organizationId: string;
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom);

  const screenComponents = {
    error: () => <div>Error Screen</div>,
    loading: () => <div>Loading Screen</div>,
    auth: () => <WidgetAuthScreen />,
    chat: () => <div>Chat Screen</div>,
    voice: () => <div>Voice Screen</div>,
    contact: () => <div>Contact Screen</div>,
    inbox: () => <div>Inbox Screen</div>,
    selection: () => <div>Selection Screen</div>,
  };

  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]()}
    </main>
  );
};
