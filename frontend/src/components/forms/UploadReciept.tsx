import React, { useState } from 'react';
import { Label, TextInput, Button, Accordion } from 'flowbite-react';
import { auth } from 'src/firebase-config';
import { uploadManualInvoice, ManualInvoice } from 'src/index';

const ManualInvoiceForm: React.FC = () => {
  const [month, setMonth] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [energyCost, setEnergyCost] = useState('');
  const [networkCost, setNetworkCost] = useState('');
  const [surcharges, setSurcharges] = useState('');
  const [penalties, setPenalties] = useState('');
  const [vat, setVat] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const keyId = auth.config.apiKey;
  const userSessionid = 'firebase:authUser:' + keyId + ':[DEFAULT]';

  const getUid = (): string => {
    const sessionUser = sessionStorage.getItem(userSessionid);
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        if ('uid' in user) {
          return user.uid;
        }
      } catch {}
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !month ||
      !totalAmount ||
      !energyCost ||
      !networkCost ||
      !surcharges ||
      !penalties ||
      !vat
    ) {
      alert('Izpolni vsa polja.');
      return;
    }
    setLoading(true);

    const uid = getUid();
    if (!uid) {
      alert('Napaka: UID ni na voljo.');
      setLoading(false);
      return;
    }

    const invoice: ManualInvoice = {
      uid: uid,
      month: month,
      totalAmount: parseFloat(totalAmount.replace(',', '.')),
      energyCost: parseFloat(energyCost.replace(',', '.')),
      networkCost: parseFloat(networkCost.replace(',', '.')),
      surcharges: parseFloat(surcharges.replace(',', '.')),
      penalties: parseFloat(penalties.replace(',', '.')),
      vat: parseFloat(vat.replace(',', '.')),
      note: note,
    };

    try {
      await uploadManualInvoice(invoice);
      alert('Račun uspešno vnešen!');
      setMonth('');
      setTotalAmount('');
      setEnergyCost('');
      setNetworkCost('');
      setSurcharges('');
      setPenalties('');
      setVat('');
      setNote('');
    } catch (error) {
      alert('Napaka pri shranjevanju računa.');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title text-xl font-semibold mb-4">Ročni vnos podatkov z računa</h5>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="month" value="Mesec" className="mb-1 block" />
              <input
                id="month"
                type="month"
                className="w-full border p-2 rounded"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="totalAmount" value="Znesek skupaj (€)" className="mb-1 block" />
              <TextInput
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="energyCost" value="Strošek energije (€)" className="mb-1 block" />
              <TextInput
                id="energyCost"
                type="number"
                step="0.01"
                min="0"
                value={energyCost}
                onChange={(e) => setEnergyCost(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="networkCost" value="Omrežnina (€)" className="mb-1 block" />
              <TextInput
                id="networkCost"
                type="number"
                step="0.01"
                min="0"
                value={networkCost}
                onChange={(e) => setNetworkCost(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="surcharges" value="Prispevki in ostalo (€)" className="mb-1 block" />
              <TextInput
                id="surcharges"
                type="number"
                step="0.01"
                min="0"
                value={surcharges}
                onChange={(e) => setSurcharges(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="penalties" value="Penali (€)" className="mb-1 block" />
              <TextInput
                id="penalties"
                type="number"
                step="0.01"
                min="0"
                value={penalties}
                onChange={(e) => setPenalties(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="vat" value="DDV (€)" className="mb-1 block" />
              <TextInput
                id="vat"
                type="number"
                step="0.01"
                min="0"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="note" value="Opomba" className="mb-1 block" />
              <TextInput
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opomba ali posebnosti na računu"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 flex gap-3 mt-6">
          <Button type="submit" color="primary" isProcessing={loading}>
            {loading ? 'Shranjujem...' : 'Shrani račun'}
          </Button>
          <Button
            type="reset"
            color="gray"
            onClick={() => {
              setMonth('');
              setTotalAmount('');
              setEnergyCost('');
              setNetworkCost('');
              setSurcharges('');
              setPenalties('');
              setVat('');
              setNote('');
            }}
          >
            Prekliči
          </Button>
        </div>
      </form>
      <div className="mt-8">
        <Accordion collapseAll>
          <Accordion.Panel>
            <Accordion.Title>Kako izpolniti podatke?</Accordion.Title>
            <Accordion.Content>
              <ol className="list-decimal pl-5 text-sm space-y-2">
                <li>Odpri PDF ali tiskano verzijo računa za elektriko.</li>
                <li>Za vsak podatek prepiši vrednost s tvojega računa v ustrezno polje.</li>
                <li>Za <strong>mesec</strong> izberi pravilen mesec (npr. 2024-05).</li>
                <li>Za <strong>penale</strong> vnesi znesek, če si plačal kazen zaradi presežene moči ali česar koli drugega.</li>
                <li>
                  Dodaj <strong>opombo</strong>, če želiš zapisati dodatna pojasnila (npr. razlog za penale, sprememba cen, posebnosti).
                </li>
                <li>Klikni <strong>Shrani račun</strong>.</li>
              </ol>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
  );
};

export default ManualInvoiceForm;
