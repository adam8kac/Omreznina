import React, { useRef, useState } from 'react';
import { Label, Button, FileInput, Accordion } from 'flowbite-react';
import instructions1 from '../../assets/images/instructions/instructions1.png';
import instructions4 from '../../assets/images/instructions/instructions4.png';

import { getUserDocIds, uploadMonthlyPower, uploadMonthlyOptimal, getAgreedPowers } from 'src/index';
import { auth } from 'src/firebase-config';

export default function Upload15min() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const keyId = auth.config.apiKey;
  const userSessionid = 'firebase:authUser:' + keyId + ':[DEFAULT]';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Naloži datoteko.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uid = await getUid();
      if (!uid) {
        setError('Napaka: uporabnik ni prijavljen.');
        return;
      }

      const numOfDocsBefore = (await getUserDocIds(uid as string)).length;
      formData.append('uid', uid);

      let agreedPowers: Record<string, number> | null = null;
      try {
        agreedPowers = await getAgreedPowers(uid);
      } catch (err) {
        setError('Najprej nastavi dogovorjene moči v razdelku "Moj profil"!');
        return;
      }
      if (!agreedPowers || Object.keys(agreedPowers).length === 0) {
        setError('Najprej nastavi dogovorjene moči v razdelku "Moj profil"!');
        return;
      }
      // Divide all agreed powers by 1000
      agreedPowers = Object.fromEntries(Object.entries(agreedPowers).map(([key, value]) => [key, value / 1000]));
      formData.append('power_by_months', JSON.stringify(agreedPowers));

      await uploadMonthlyPower(formData);
      await uploadMonthlyOptimal(formData);

      const numOfDocsAfter = (await getUserDocIds(uid as string)).length;

      if (numOfDocsAfter > numOfDocsBefore) {
        setSuccess('Podatki uspešno naloženi!');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('Napaka pri nalaganju podatkov.');
      }
    } catch (err) {
      console.error(err);
      setError('Prišlo je do napake med nalaganjem.');
    }
  };

  const getUid = async () => {
    const sessionUser = sessionStorage.getItem(userSessionid);

    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        if ('uid' in user) {
          const id = user.uid;
          return id;
        }
      } catch (error) {
        //    console.log(error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title text-xl font-semibold mb-4">
        Nalaganje izpiska iz MojElektro.si za prekoračitve in optimum dogovorjene moči
      </h5>
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
              ) : (
                error === 'Naloži datoteko.' && <p className="text-sm text-red-600 mt-1">⚠️ Naložite datoteko.</p>
              )}
            </div>
          </div>

          <div className="col-span-12 flex gap-3 mt-2">
            <Button type="submit" color="primary">
              Naloži csv ali excel
            </Button>
            <Button
              type="reset"
              color="gray"
              onClick={() => {
                setFile(null);
                setError(null);
                setSuccess(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Prekliči
            </Button>
          </div>
          {error && error !== 'Naloži datoteko.' && (
            <div className="col-span-12 mt-3 text-red-600 text-sm font-medium">⚠️ {error}</div>
          )}

          {success && <div className="col-span-12 mt-3 text-green-600 text-sm font-medium">✅ {success}</div>}
        </div>
      </form>

      <div className="mt-8">
        <Accordion collapseAll>
          <Accordion.Panel>
            <Accordion.Title>Kako prenesti 15-minutni izpis iz mojelektro.si?</Accordion.Title>
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
                  V meniju klikni na <strong>Merilna mesta / merilne točke</strong>.
                </li>
                <li>
                  Nato izberi zavihek <strong>15 minutni podatki</strong>.
                </li>
                <li>
                  Izberi prikaz <strong>Moč</strong>, da se prikažejo podatki o odjemni in oddani delovni moči.
                </li>
                <li>
                  Znotraj izbirnika obdobja izberi <strong>Prejšnje leto</strong> ali drugo obdobje, nato klikni{' '}
                  <strong>Potrdi</strong>.
                </li>
                <li>
                  Klikni gumb <strong>Izvozi Excel</strong> ali <strong>Izvozi CSV</strong>, da preneseš datoteko.
                </li>
                <li>Ko je datoteka prenesena, jo naloži v zgornji obrazec.</li>
              </ol>
              <div className="mt-4 space-y-4">
                <img src={instructions1} alt="Koraki 1–2" className="rounded-md border shadow-sm" />
                <img src={instructions4} alt="Koraki 3–6" className="rounded-md border shadow-sm" />
              </div>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
  );
}
