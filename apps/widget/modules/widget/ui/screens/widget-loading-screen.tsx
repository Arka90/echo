"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  widgetSettingsAtom,
} from "../../atoms/widget-atoms";
import { WidgetHeader } from "../components/widget-header";
import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";

export const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("org");
  const [sessionValid, setSessionValid] = useState<boolean>(false);
  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);

  const validateOrganization = useAction(api.public.organizations.validate);

  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );

  useEffect(() => {
    if (step !== "org") return;
    setLoadingMessage("Loading organization...");
    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }
    setLoadingMessage("Validating organization...");

    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setStep("session");
          setOrganizationId(organizationId);
        } else {
          setErrorMessage(result.reason || "Invalid organization");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Failed to validate organization");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setLoadingMessage,
    validateOrganization,
    setOrganizationId,
  ]);

  useEffect(() => {
    if (step !== "session") return;
    if (!contactSessionId) {
      setSessionValid(false);
      setStep("settings");
      return;
    }
    setLoadingMessage("Finding contact session Id...");

    validateContactSession({
      contactSessionId: contactSessionId as Id<"contactSessions">,
    })
      .then((result) => {
        if (result.valid) {
          setSessionValid(result.valid);
          setStep("settings");
        } else {
          setSessionValid(false);
          setStep("settings");
        }
      })
      .catch(() => {
        setSessionValid(false);
        setStep("done");
      });
  }, [step, setLoadingMessage, contactSessionId, validateContactSession]);

  const widgetSettings = useQuery(
    api.public.widgetSettings.getWidgetSettingsByOrganizationId,
    organizationId ? { organizationId } : "skip"
  );

  useEffect(() => {
    if (step !== "settings") return;
    setLoadingMessage("Loading widget settings...");

    if (widgetSettings !== undefined) {
      setWidgetSettings(widgetSettings);
      setStep("done");
    }
  }, [step, setStep, widgetSettings, setLoadingMessage, setWidgetSettings]);

  useEffect(() => {
    if (step !== "done") return;

    const hasValidSession = sessionValid && contactSessionId;

    setScreen(hasValidSession ? "selection" : "auth");
  }, [contactSessionId, sessionValid, setScreen, step]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6">
          <p className="font-semibold text-3xl">Hi there! 👋</p>
          <p className="font-semibold text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col text-muted-foreground items-center justify-center gap-y-4 p-4">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading.."}</p>
      </div>
    </>
  );
};
