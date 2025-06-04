import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { getSubcollectionsConsumption } from 'src/index';

type UploadTypes = 'invoice' | 'receipt' | 'minutni';

type UploadLoadingState = {
  [key in UploadTypes]: {
    isLoading: boolean;
    progress: number;
    message?: string;
    uid?: string;
  }
};

type UploadLoadingContextType = {
  state: UploadLoadingState;
  setLoading: (type: UploadTypes, isLoading: boolean) => void;
  setProgress: (type: UploadTypes, progress: number) => void;
  setMessage: (type: UploadTypes, message: string) => void;
  startPolling: (type: UploadTypes, uid: string) => void;
  resetPolling: (type: UploadTypes) => void;
};

const UploadLoadingContext = createContext<UploadLoadingContextType | undefined>(undefined);

export const UploadLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UploadLoadingState>({
    invoice: { isLoading: false, progress: 0 },
    receipt: { isLoading: false, progress: 0 },
    minutni: { isLoading: false, progress: 0 },
  });

  const pollingRef = useRef<{[key in UploadTypes]?: { interval?: number, timeout?: number, finished?: boolean } }>({});
  const prevSubColRef = useRef<{[key: string]: string[]}>({});

  const setLoading = (type: UploadTypes, isLoading: boolean) => {
    setState((prev) => ({
      ...prev,
      [type]: { ...prev[type], isLoading }
    }));
  };

  const setProgress = (type: UploadTypes, progress: number) => {
    setState((prev) => ({
      ...prev,
      [type]: { ...prev[type], progress }
    }));
  };

  const setMessage = (type: UploadTypes, message: string) => {
    setState((prev) => ({
      ...prev,
      [type]: { ...prev[type], message }
    }));
  };

    const startPolling = async (type: UploadTypes, uid: string) => {
    if (pollingRef.current[type]?.interval) return;

    const docIds = type === 'minutni'
        ? ['prekoracitve', 'optimum']
        : [];

    setLoading(type, true);
    setProgress(type, 90);
    setMessage(type, 'Zaključujem obdelavo...');

    let completed: {[docId: string]: boolean} = {};

    const prevResults = await Promise.all(
        docIds.map(docId => getSubcollectionsConsumption(uid, docId))
    );
    docIds.forEach((docId, i) => {
        prevSubColRef.current[type + docId] = prevResults[i] || [];
        if ((prevResults[i] || []).length > 0) {
        completed[docId] = true;
        }
    });

    if (docIds.every(docId => completed[docId])) {
        setLoading(type, false);
        setProgress(type, 100);
        setMessage(type, 'Podatki uspešno naloženi ali posodobljeni.');
        pollingRef.current[type] = {};
        return;
    }

    if (!pollingRef.current[type]) pollingRef.current[type] = {};
    pollingRef.current[type]!.finished = false;
    pollingRef.current[type]!.timeout = window.setTimeout(() => {
        pollingRef.current[type]!.finished = true;
        setLoading(type, false);
        setMessage(type, 'Podatki niso bili spremenjeni (timeout, ni sprememb v podatkovni bazi).');
        if (pollingRef.current[type]?.interval) clearTimeout(pollingRef.current[type]!.interval);
        pollingRef.current[type] = {};
    }, 5 * 60 * 1000);

    const poll = async () => {
        if (pollingRef.current[type]?.finished) return;

        for (let docId of docIds) {
        try {
            const curSub = await getSubcollectionsConsumption(uid, docId);
            const prev = prevSubColRef.current[type + docId] || [];
            if (
            curSub.length > 0 &&
            (curSub.length !== prev.length ||
            JSON.stringify(prev) !== JSON.stringify(curSub))
            ) {
            completed[docId] = true;
            prevSubColRef.current[type + docId] = curSub;
            }
        } catch (err) {
        }
        }

        if (docIds.every(docId => completed[docId])) {
        if (pollingRef.current[type]?.interval) clearTimeout(pollingRef.current[type]!.interval);
        if (pollingRef.current[type]?.timeout) clearTimeout(pollingRef.current[type]!.timeout);
        setLoading(type, false);
        setProgress(type, 100);
        setMessage(type, 'Podatki uspešno naloženi ali posodobljeni.');
        pollingRef.current[type]!.finished = true;
        pollingRef.current[type] = {};
        return;
        }
        pollingRef.current[type]!.interval = window.setTimeout(poll, 6000);
    };

    pollingRef.current[type]!.interval = window.setTimeout(poll, 1200);
    };


  const resetPolling = (type: UploadTypes) => {
    if (pollingRef.current[type]?.interval) clearTimeout(pollingRef.current[type]!.interval);
    if (pollingRef.current[type]?.timeout) clearTimeout(pollingRef.current[type]!.timeout);
    pollingRef.current[type] = {};
    setLoading(type, false);
    setProgress(type, 0);
    setMessage(type, '');
  };

  return (
    <UploadLoadingContext.Provider value={{
      state, setLoading, setProgress, setMessage, startPolling, resetPolling
    }}>
      {children}
    </UploadLoadingContext.Provider>
  );
};

export const useUploadLoading = (type: UploadTypes) => {
  const ctx = useContext(UploadLoadingContext);
  if (!ctx) throw new Error('useUploadLoading moraš uporabljati znotraj UploadLoadingProvider');
  const { state, setLoading, setProgress, setMessage, startPolling, resetPolling } = ctx;
  return {
    isLoading: state[type].isLoading,
    progress: state[type].progress,
    message: state[type].message || '',
    setIsLoading: (v: boolean) => setLoading(type, v),
    setProgress: (v: number) => setProgress(type, v),
    setMessage: (v: string) => setMessage(type, v),
    startPolling: (uid: string) => startPolling(type, uid),
    resetPolling: () => resetPolling(type),
  };
};
