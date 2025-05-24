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
              <h6 className="font-semibold mb-2">Navodila za izpolnjevanje posameznih polj</h6>
              <ul className="list-disc pl-6 text-sm space-y-2 mb-5">
                <li>
                  <b>Znesek skupaj (€):</b> Skupni znesek brez DDV (<i>Skupaj obračunano brez DDV</i>). Če ni posebej naveden, seštejte vse postavke brez DDV. Primer: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">43,30</span>
                </li>
                <li>
                  <b>Strošek energije (€):</b> Le strošek za energijo (npr. Energija VT + MT + ET). Primer: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">30,70</span>
                </li>
                <li>
                  <b>Omrežnina (€):</b> Strošek za omrežnino (običajno "Omrežnina Skupaj" ali "Omrežnina ET"). Primer: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">9,94</span>
                </li>
                <li>
                  <b>Prispevki in ostalo (€):</b> Vsi prispevki, trošarine, pavšalne storitve, E-mobilnost, nadomestila ipd. Če imate postavko "Ostalo", vpišite to vrednost. Primer: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">2,66</span>
                </li>
                <li>
                  <b>Penali (€):</b> Znesek za kazni, preseženo moč, penalizacije (običajno 0, če ni posebnih prekrškov). Primer: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">0</span>
                </li>
                <li>
                  <b>DDV (€):</b> Skupni DDV. Če ni posebej izpisan, izračunajte kot 22 % od <i>Znesek skupaj</i>. Primer: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">9,53</span>
                </li>
                <li>
                  <b>Opomba:</b> Poljubno – tukaj lahko zapišete posebnosti, popuste, opombe za kasnejšo evidenco (npr. “Presežena moč v tem mesecu”, “Poseben popust” ipd.).
                </li>
              </ul>

              <div className="mt-8 space-y-7">
                {/* Legenda */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-2">
                      🏷️ Legenda
                    </div>
                    <ul className="text-sm text-blue-900 space-y-1">
                      <li><span className="font-bold text-blue-700">VT</span> – Visoka tarifa</li>
                      <li><span className="font-bold text-blue-700">MT</span> – Mala tarifa</li>
                      <li><span className="font-bold text-blue-700">ET</span> – Enotna tarifa</li>
                    </ul>
                  </div>
                  <div>
                    <ul className="text-sm text-blue-900 space-y-1">
                      <li>🔢 Če je postavka navedena večkrat (npr. <span className="font-mono">Energija VT + MT</span>), jih preprosto seštejte.</li>
                      <li>💶 Vsi zneski so brez DDV (razen v polju DDV).</li>
                      <li>📄 Če ste v dvomih, vedno preverite <span className="underline">skupni znesek</span> na dnu računa.</li>
                    </ul>
                  </div>
                </div>

                {/* Primer vnosa */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                  <div className="font-bold text-base mb-4 flex items-center gap-2">
                    📝 Primer vnosa (marec 2025)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded">
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 font-semibold text-gray-700">Mesec</td>
                          <td className="px-4 py-2 font-mono">2025-03</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-semibold text-gray-700">Znesek skupaj (€)</td>
                          <td className="px-4 py-2 font-mono">43,30</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 font-semibold text-gray-700">Strošek energije (€)</td>
                          <td className="px-4 py-2 font-mono">30,70</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-semibold text-gray-700">Omrežnina (€)</td>
                          <td className="px-4 py-2 font-mono">9,94</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 font-semibold text-gray-700">Prispevki / ostalo (€)</td>
                          <td className="px-4 py-2 font-mono">2,66</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-semibold text-gray-700">Penali (€)</td>
                          <td className="px-4 py-2 font-mono">0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 font-semibold text-gray-700">DDV (€)</td>
                          <td className="px-4 py-2 font-mono">9,53</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-semibold text-gray-700">Opomba</td>
                          <td className="px-4 py-2 text-gray-500 font-mono">–</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Primer izračuna DDV */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                  <div className="font-bold text-green-900 text-base flex items-center gap-2">
                    💡 Primer izračuna DDV
                  </div>
                  <div className="text-sm text-green-900">
                    Če imate samo znesek brez DDV (npr. <span className="font-mono bg-white rounded px-1 py-0.5">43,30</span> €), potem DDV = <span className="font-mono">43,30 × 0,22 = <span className="font-bold text-green-700">9,53 €</span></span>
                  </div>
                </div>

                {/* Več informacij */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                    ℹ️ Več informacij
                  </div>
                  <ul className="text-sm text-gray-700 list-disc pl-6 space-y-1">
                    <li>Če izračunavate kakšno postavko, uporabite kalkulator.</li>
                    <li>Vrednosti vedno vnašajte <span className="underline">brez DDV</span>, razen v polju za DDV.</li>
                    <li>Če imate več različnih postavk energije ali prispevkov, jih preprosto seštejte.</li>
                    <li>Če je polje 0 (na primer Penali), vnesite <span className="font-mono">0</span>.</li>
                  </ul>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
  );
};

export default ManualInvoiceForm;
