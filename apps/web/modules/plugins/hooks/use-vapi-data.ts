import { api } from "@workspace/backend/_generated/api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PhoneNumber = typeof api.private.vapi.getPhoneNumber._returnType;
type Assistants = typeof api.private.vapi.getAssistants._returnType;

export const useVapiPhoneNumbers = (): {
  data: PhoneNumber;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<PhoneNumber>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const getPhoneNumbers = useAction(api.private.vapi.getPhoneNumber);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getPhoneNumbers();
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (error) {
        if (cancelled) return;
        setError(error as Error);
        toast.error("Failed to load phone numbers");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
};

export const useVapiAssistants = (): {
  data: Assistants;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<Assistants>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const getAssistants = useAction(api.private.vapi.getAssistants);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getAssistants();
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (error) {
        if (cancelled) return;
        setError(error as Error);
        toast.error("Failed to load phone numbers");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
};
