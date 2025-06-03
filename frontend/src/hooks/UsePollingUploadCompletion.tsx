import { useRef, useCallback } from 'react';

type UsePollingArgs = {
  uid: string;
  docId: string;
  getSubCollections: (uid: string, docId: string) => Promise<string[]>;
  onSuccess: (newData: any) => void;
  onNoChange?: () => void;
  pollingInterval?: number;
  timeout?: number;
};

export function usePollingUploadCompletion({
  uid,
  docId,
  getSubCollections,
  onSuccess,
  onNoChange,
  pollingInterval = 6000,
  timeout = 5 * 60 * 1000,
}: UsePollingArgs) {
  const previousSubCol = useRef<string[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startPolling = useCallback(async () => {
    try {
      previousSubCol.current = await getSubCollections(uid, docId);
    } catch {
      previousSubCol.current = [];
    }
    let timedOut = false;

    timeoutRef.current = window.setTimeout(() => {
      timedOut = true;
      stopPolling();
      onNoChange && onNoChange();
    }, timeout);

    const poll = async () => {
      try {
        const cur = await getSubCollections(uid, docId);
        if (
          cur.length > 0 &&
          (cur.length !== previousSubCol.current.length ||
            JSON.stringify(cur) !== JSON.stringify(previousSubCol.current))
        ) {
          stopPolling();
          onSuccess(cur);
          previousSubCol.current = cur;
          return;
        }
      } catch {}
      if (!timedOut) intervalRef.current = window.setTimeout(poll, pollingInterval);
    };
    intervalRef.current = window.setTimeout(poll, pollingInterval);
  }, [uid, docId, getSubCollections, onSuccess, onNoChange, timeout, pollingInterval]);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearTimeout(intervalRef.current);
  }, []);

  return { startPolling, stopPolling };
}