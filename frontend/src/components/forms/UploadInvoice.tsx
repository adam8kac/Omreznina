import React, { useRef, useState, useEffect } from 'react';
import { Label, Button, FileInput, Accordion, Progress } from 'flowbite-react';
import instructions1 from '../../assets/images/instructions/instructions1.png';
import instructions2 from '../../assets/images/instructions/instructions2.png';
import Lottie from 'lottie-react';
import plugLoading from '../../assets/lottie/Animation - 1748963030379.json';

import { getUserDocIds, uploadMonthlyFile } from 'src/index';
import { auth } from 'src/firebase-config';
import { useUploadLoading } from '../../contexts/UploadLoadingContext';

const UploadInvoice: React.FC = () => {
  const {
    isLoading, setIsLoading, progress, setProgress, message: resultMsg,
    setMessage, startPolling
  } = useUploadLoading('invoice');

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = [
    'Vzpostavljam povezavo s strežnikom...',
    'Obdelujem podatke iz računa...',
    'Shranjujem vsebino v bazo...',
    'Pripravljam vpoglede...',
    'Obdelava lahko traja nekaj minut, prosimo za potrpežljivost.',
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % messages.length);
      }, 8000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isLoading, messages.length]);

  const keyId = auth.config.apiKey;
  const userSessionid = 'firebase:authUser:' + keyId + ':[DEFAULT]';
  const getUid = async () => {
    const sessionUser = sessionStorage.getItem(userSessionid);
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        if ('uid' in user) return user.uid as string;
      } catch {}
    }
    return null;
  };

  useEffect(() => {
    setError(null);
    setMessage('');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage('');

    if (!file) {
      setError('Naloži datoteko.');
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      const uid = await getUid();
      if (!uid) {
        setError('Uporabniški ID ni na voljo.');
        setIsLoading(false);
        setProgress(0);
        return;
      }

      const numOfDocsBefore = (await getUserDocIds(uid)).length;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', uid);

      setProgress(35);
      await uploadMonthlyFile(formData);
      setProgress(75);

      const numOfDocsAfter = (await getUserDocIds(uid)).length;

      if (numOfDocsAfter > numOfDocsBefore) {
        setProgress(90);
        startPolling(uid);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFile(null);
      } else {
        setError('Napaka pri nalaganju podatkov.');
        setIsLoading(false);
        setProgress(0);
      }
    } catch (error) {
      setError('Prišlo je do napake med nalaganjem.');
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="text-xl font-semibold mb-4 text-center">
        Nalaganje izpiska iz MojElektro.si za mesečno porabo
      </h5>
      <div className="sm:hidden flex flex-col items-center w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 gap-4 w-full">
            <div className="w-40 h-40">
              <Lottie animationData={plugLoading} loop autoplay />
            </div>
            <p className="text-sm text-center font-medium animate-pulse">
              {messages[loadingMsgIndex]}
            </p>
            <div className="w-full max-w-md text-center">
              <Progress progress={progress} color="blue" size="md" />
              <p className="text-sm mt-1 text-gray-600 font-medium">{progress}%</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <div className="w-full flex flex-col gap-4 items-center">
              <Label htmlFor="fileInput" value="Izberi datoteko" className="mb-1 block text-center" />
              <FileInput
                id="fileInput"
                ref={fileInputRef}
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                className={error === 'Naloži datoteko.' ? 'border border-red-500 rounded-lg' : ''}
              />
              {file ? (
                <p className="text-sm text-green-600 mt-1 text-center">Izbrana datoteka: {file.name}</p>
              ) : error === 'Naloži datoteko.' && (
                <p className="text-sm text-red-600 mt-1 text-center">
                  ⚠️ Naložite datoteko.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 mt-4 w-full items-center">
              <Button type="submit" color="primary" disabled={isLoading} className="w-full">Naloži csv ali excel</Button>
              <Button
                type="reset"
                color="gray"
                onClick={() => {
                  setFile(null);
                  setError(null);
                  setMessage('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isLoading}
                className="w-full"
              >
                Prekliči
              </Button>
            </div>
            {error && error !== 'Naloži datoteko.' && (
              <div className="mt-3 text-red-600 text-sm font-medium text-center w-full">⚠️ {error}</div>
            )}
            {resultMsg && (
              <div className="mt-3 text-green-600 text-sm font-medium text-center w-full">✅ {resultMsg}</div>
            )}
          </form>
        )}
        <div className="mt-8 w-full">
          <Accordion collapseAll>
            <Accordion.Panel>
              <Accordion.Title>Kako prenesti izpis iz mojelektro.si?</Accordion.Title>
              <Accordion.Content>
                <ol className="list-decimal pl-5 text-sm space-y-2 text-left">
                  <li>
                    Prijavi se v sistem{' '}
                    <a
                      href="https://mojelektro.si"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      mojelektro.si
                    </a>
                    .
                  </li>
                  <li>
                    Izberi meni <strong>Merilna mesta / merilne točke</strong>.
                  </li>
                  <li>Na seznamu klikni na merilno točko, za katero želiš račun.</li>
                  <li>
                    Iz zgornjega menija izberi <strong>Dnevna stanja</strong>.
                  </li>
                  <li>
                    Znotraj izbirnika obdobja izberi <strong>Prejšnje leto</strong> ali drugo obdobje, nato klikni <strong>Potrdi</strong>.
                  </li>
                  <li>
                    Klikni <strong>Izvozi Excel</strong> ali <strong>Izvozi CSV</strong> za prenos datoteke.
                  </li>
                  <li>Ko je datoteka prenesena, jo naloži v zgornji obrazec.</li>
                </ol>
                <div className="mt-4 space-y-4 flex flex-col items-center">
                  <img src={instructions1} alt="Koraki 1–2" className="rounded-md border shadow-sm" />
                  <img src={instructions2} alt="Koraki 3–6" className="rounded-md border shadow-sm" />
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </div>
      </div>
      <div className="hidden sm:block">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 gap-4">
            <div className="w-40 h-40">
              <Lottie animationData={plugLoading} loop autoplay />
            </div>
            <p className="text-sm text-center font-medium animate-pulse">
              {messages[loadingMsgIndex]}
            </p>
            <div className="w-full max-w-md text-center">
              <Progress progress={progress} color="blue" size="md" />
              <p className="text-sm mt-1 text-gray-600 font-medium">{progress}%</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-12 gap-6">
              <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
                <div>
                  <Label htmlFor="fileInput" value="Izberi datoteko" className="mb-1 block" />
                  <FileInput
                    id="fileInput"
                    ref={fileInputRef}
                    accept=".xlsx,.csv"
                    onChange={handleFileChange}
                    className={error === 'Naloži datoteko.' ? 'border border-red-500 rounded-lg' : ''}
                  />
                  {file ? (
                    <p className="text-sm text-green-600 mt-1">Izbrana datoteka: {file.name}</p>
                  ) : error === 'Naloži datoteko.' && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Naložite datoteko.
                    </p>
                  )}
                </div>
              </div>

              <div className="col-span-12 flex gap-3 mt-2">
                <Button type="submit" color="primary" disabled={isLoading}>
                  Naloži csv ali excel
                </Button>
                <Button
                  type="reset"
                  color="gray"
                  onClick={() => {
                    setFile(null);
                    setError(null);
                    setMessage('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isLoading}
                >
                  Prekliči
                </Button>
              </div>
              {error && error !== 'Naloži datoteko.' && (
                <div className="col-span-12 mt-3 text-red-600 text-sm font-medium">⚠️ {error}</div>
              )}
              {resultMsg && (
                <div className="col-span-12 mt-3 text-green-600 text-sm font-medium">✅ {resultMsg}</div>
              )}
            </div>
          </form>
        )}
        <div className="mt-8">
          <Accordion collapseAll>
            <Accordion.Panel>
              <Accordion.Title>Kako prenesti izpis iz mojelektro.si?</Accordion.Title>
              <Accordion.Content>
                <ol className="list-decimal pl-5 text-sm space-y-2">
                  <li>
                    Prijavi se v sistem{' '}
                    <a
                      href="https://mojelektro.si"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      mojelektro.si
                    </a>
                    .
                  </li>
                  <li>
                    Izberi meni <strong>Merilna mesta / merilne točke</strong>.
                  </li>
                  <li>Na seznamu klikni na merilno točko, za katero želiš račun.</li>
                  <li>
                    Iz zgornjega menija izberi <strong>Dnevna stanja</strong>.
                  </li>
                  <li>
                    Znotraj izbirnika obdobja izberi <strong>Prejšnje leto</strong> ali drugo obdobje, nato klikni <strong>Potrdi</strong>.
                  </li>
                  <li>
                    Klikni <strong>Izvozi Excel</strong> ali <strong>Izvozi CSV</strong> za prenos datoteke.
                  </li>
                  <li>Ko je datoteka prenesena, jo naloži v zgornji obrazec.</li>
                </ol>
                <div className="mt-4 space-y-4">
                  <img src={instructions1} alt="Koraki 1–2" className="rounded-md border shadow-sm" />
                  <img src={instructions2} alt="Koraki 3–6" className="rounded-md border shadow-sm" />
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default UploadInvoice;
