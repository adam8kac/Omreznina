import React, { useRef, useState } from 'react';
import { Label, Button, FileInput, Accordion } from 'flowbite-react';
import instructions1 from '../../assets/images/instructions/instructions1.png';
import instructions2 from '../../assets/images/instructions/instructions2.png';

import { getUserDocIds, uploadMonthlyFile } from 'src/index';
import { auth } from 'src/firebase-config';

const UploadInvoice: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const keyId = auth.config.apiKey;
  const userSessionid = 'firebase:authUser:' + keyId + ':[DEFAULT]';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Naloži datoteko.');
      return;
    }

    const fromData = new FormData();
    fromData.append('file', file);

    try {
      const uid = await getUid();
      if (!uid) {
        console.log('Uid notavalible');
      }

      const numOfDocsBefore = (await getUserDocIds(uid as string)).length;
      fromData.append('uid', uid);

      await uploadMonthlyFile(fromData);
      const numOfDocsAfter = (await getUserDocIds(uid as string)).length;

      if (numOfDocsAfter > numOfDocsBefore) {
        alert('Račun uspešno naložen!');
      } else {
        alert('Ne gre');
      }

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.log(error);
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
      <h5 className="card-title text-xl font-semibold mb-4">Ročno nalaganje izpiska iz MojElektro.si</h5>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="fileInput" value="Izberi datoteko" className="mb-1 block" />
              <FileInput id="fileInput" ref={fileInputRef} accept=".xlsx,.csv" onChange={handleFileChange} required />
              {file && <p className="text-sm text-green-600 mt-1">Izbrana datoteka: {file.name}</p>}
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
              }}
            >
              Prekliči
            </Button>
          </div>
        </div>
      </form>

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
                  V izbirniku obdobja izberi <strong>Prejšnji mesec</strong> in klikni <strong>Potrdi</strong>.
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
  );
};

export default UploadInvoice;
