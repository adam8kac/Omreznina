import React, { useEffect, useState } from 'react';
import { Label, TextInput, Button, Accordion } from 'flowbite-react';
import { auth } from 'src/firebase-config';
import { uploadManualInvoice, ManualInvoice } from 'src/index';
import { debounce } from 'lodash';

export default function ManualInvoiceForm() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [energyCost, setEnergyCost] = useState('');
  const [networkCost, setNetworkCost] = useState('');
  const [surcharges, setSurcharges] = useState('');
  const [penalties, setPenalties] = useState('');
  const [vat, setVat] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const keyId = auth.config.apiKey;
  const userSessionid = 'firebase:authUser:' + keyId + ':[DEFAULT]';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 9 }, (_, i) => `${currentYear - i}`);
  const months = [
    { value: '01', label: 'Januar' },
    { value: '02', label: 'Februar' },
    { value: '03', label: 'Marec' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Maj' },
    { value: '06', label: 'Junij' },
    { value: '07', label: 'Julij' },
    { value: '08', label: 'Avgust' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

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
    const newErrors: { [key: string]: string } = {};

    if (!year) newErrors.year = 'Izberite leto.';
    if (!month) newErrors.month = 'Izberite mesec.';
    if (!totalAmount) newErrors.totalAmount = 'Vnesite skupni znesek.';
    if (!energyCost) newErrors.energyCost = 'Vnesite strošek energije.';
    if (!networkCost) newErrors.networkCost = 'Vnesite omrežnino.';
    if (!surcharges) newErrors.surcharges = 'Vnesite prispevke in ostalo.';
    if (!penalties) newErrors.penalties = 'Vnesite penalizacije (0, če jih ni).';
    if (!vat) newErrors.vat = 'Vnesite DDV.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    const uid = getUid();
    if (!uid) {
      alert('Napaka: UID ni na voljo.');
      setLoading(false);
      return;
    }

    const fullMonth = `${year}-${month}`;
    const invoice: ManualInvoice = {
      uid: uid,
      month: fullMonth,
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
      setErrors({});
      setSuccessMessage('Račun uspešno vnešen!');
      setTimeout(() => setSuccessMessage(''), 5000);
      setYear('');
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

  const debouncedUpload = debounce((data: ManualInvoice) => {
    uploadManualInvoice(data)
      .then(() => console.log('Auto-saved invoice'))
      .catch((e) => console.error('Auto-save failed:', e));
}, 1000);

  useEffect(() => {
    const uid = getUid();
    if (!uid || !year || !month) return;

    const invoice: ManualInvoice = {
      uid: uid,
      month: `${year}-${month}`,
      totalAmount: parseFloat(totalAmount.replace(',', '.') || '0'),
      energyCost: parseFloat(energyCost.replace(',', '.') || '0'),
      networkCost: parseFloat(networkCost.replace(',', '.') || '0'),
      surcharges: parseFloat(surcharges.replace(',', '.') || '0'),
      penalties: parseFloat(penalties.replace(',', '.') || '0'),
      vat: parseFloat(vat.replace(',', '.') || '0'),
      note: note,
    };

    debouncedUpload(invoice);
  }, [year, month, totalAmount, energyCost, networkCost, surcharges, penalties, vat, note]);

  return (
    <div className="p-4 space-y-4">
      <h5 className="text-xl font-semibold mb-4 text-center">Ročni vnos podatkov računa</h5>
      <div className="sm:hidden flex flex-col items-center w-full">
        {successMessage && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded mb-4 text-center w-full">
            ✅ {successMessage}
          </p>
        )}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col gap-4 items-center">
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="year" value="Leto" className="mb-1 block" />
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`w-full border border-primary/40 p-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base bg-white ${errors.year ? 'border-red-500' : ''}`}
              >
                <option value="">-- Izberi leto --</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.year && <p className="text-sm text-red-600 mt-1">⚠️ {errors.year}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="month" value="Mesec" className="mb-1 block" />
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className={`w-full border border-primary/40 p-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base bg-white ${errors.month ? 'border-red-500' : ''}`}
              >
                <option value="">-- Izberi mesec --</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {errors.month && <p className="text-sm text-red-600 mt-1">⚠️ {errors.month}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="totalAmount" value="Znesek skupaj (€)" className="mb-1 block" />
              <TextInput
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className={`w-full rounded-xl ${errors.totalAmount ? 'border-red-500' : ''}`}
              />
              {errors.totalAmount && <p className="text-sm text-red-600 mt-1">⚠️ {errors.totalAmount}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="energyCost" value="Strošek energije (€)" className="mb-1 block" />
              <TextInput
                id="energyCost"
                type="number"
                step="0.01"
                min="0"
                value={energyCost}
                onChange={(e) => setEnergyCost(e.target.value)}
                className={`w-full rounded-xl ${errors.energyCost ? 'border-red-500' : ''}`}
              />
              {errors.energyCost && <p className="text-sm text-red-600 mt-1">⚠️ {errors.energyCost}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="networkCost" value="Omrežnina (€)" className="mb-1 block" />
              <TextInput
                id="networkCost"
                type="number"
                step="0.01"
                min="0"
                value={networkCost}
                onChange={(e) => setNetworkCost(e.target.value)}
                className={`w-full rounded-xl ${errors.networkCost ? 'border-red-500' : ''}`}
              />
              {errors.networkCost && <p className="text-sm text-red-600 mt-1">⚠️ {errors.networkCost}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="surcharges" value="Prispevki in ostalo (€)" className="mb-1 block" />
              <TextInput
                id="surcharges"
                type="number"
                step="0.01"
                min="0"
                value={surcharges}
                onChange={(e) => setSurcharges(e.target.value)}
                className={`w-full rounded-xl ${errors.surcharges ? 'border-red-500' : ''}`}
              />
              {errors.surcharges && <p className="text-sm text-red-600 mt-1">⚠️ {errors.surcharges}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="penalties" value="Penali (€)" className="mb-1 block" />
              <TextInput
                id="penalties"
                type="number"
                step="0.01"
                min="0"
                value={penalties}
                onChange={(e) => setPenalties(e.target.value)}
                className={`w-full rounded-xl ${errors.penalties ? 'border-red-500' : ''}`}
              />
              {errors.penalties && <p className="text-sm text-red-600 mt-1">⚠️ {errors.penalties}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="vat" value="DDV (€)" className="mb-1 block" />
              <TextInput
                id="vat"
                type="number"
                step="0.01"
                min="0"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
                className={`w-full rounded-xl ${errors.vat ? 'border-red-500' : ''}`}
              />
              {errors.vat && <p className="text-sm text-red-600 mt-1">⚠️ {errors.vat}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="note" value="Opomba" className="mb-1 block" />
              <TextInput
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opomba ali posebnosti na računu"
                className="w-full rounded-xl"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 w-full items-center">
            <Button type="submit" color="primary" isProcessing={loading} className="w-full">
              {loading ? 'Shranjujem...' : 'Shrani račun'}
            </Button>
            <Button
              type="reset"
              color="gray"
              onClick={() => {
                setYear('');
                setMonth('');
                setTotalAmount('');
                setEnergyCost('');
                setNetworkCost('');
                setSurcharges('');
                setPenalties('');
                setVat('');
                setNote('');
                setErrors({});
              }}
              className="w-full"
            >
              Prekliči
            </Button>
          </div>
        </form>
        <div className="mt-8 w-full">
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

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                    <div className="font-bold text-green-900 text-base flex items-center gap-2">
                      💡 Primer izračuna DDV
                    </div>
                    <div className="text-sm text-green-900">
                      Če imate samo znesek brez DDV (npr. <span className="font-mono bg-white rounded px-1 py-0.5">43,30</span> €), potem DDV = <span className="font-mono">43,30 × 0,22 = <span className="font-bold text-green-700">9,53 €</span></span>
                    </div>
                  </div>

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
      <div className="hidden sm:block">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-6">
            <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="flex-1">
                  <Label htmlFor="year" value="Leto" className="mb-1 block" />
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={`w-full border border-primary/40 p-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base bg-white ${errors.year ? 'border-red-500' : ''}`}
                  >
                    <option value="">-- Izberi leto --</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.year && <p className="text-sm text-red-600 mt-1">⚠️ {errors.year}</p>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="month" value="Mesec" className="mb-1 block" />
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={`w-full border border-primary/40 p-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base bg-white ${errors.month ? 'border-red-500' : ''}`}
                  >
                    <option value="">-- Izberi mesec --</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  {errors.month && <p className="text-sm text-red-600 mt-1">⚠️ {errors.month}</p>}
                </div>
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
                  className={errors.totalAmount ? 'border-red-500' : ''}
                />
                {errors.totalAmount && <p className="text-sm text-red-600 mt-1">⚠️ {errors.totalAmount}</p>}
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
                  className={errors.energyCost ? 'border-red-500' : ''}
                />
                {errors.energyCost && <p className="text-sm text-red-600 mt-1">⚠️ {errors.energyCost}</p>}
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
                  className={errors.networkCost ? 'border-red-500' : ''}
                />
                {errors.networkCost && <p className="text-sm text-red-600 mt-1">⚠️ {errors.networkCost}</p>}
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
                  className={errors.surcharges ? 'border-red-500' : ''}
                />
                {errors.surcharges && <p className="text-sm text-red-600 mt-1">⚠️ {errors.surcharges}</p>}
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
                  className={errors.penalties ? 'border-red-500' : ''}
                />
                {errors.penalties && <p className="text-sm text-red-600 mt-1">⚠️ {errors.penalties}</p>}
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
                  className={errors.vat ? 'border-red-500' : ''}
                />
                {errors.vat && <p className="text-sm text-red-600 mt-1">⚠️ {errors.vat}</p>}
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
                setYear('');
                setMonth('');
                setTotalAmount('');
                setEnergyCost('');
                setNetworkCost('');
                setSurcharges('');
                setPenalties('');
                setVat('');
                setNote('');
                setErrors({});
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

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                    <div className="font-bold text-green-900 text-base flex items-center gap-2">
                      💡 Primer izračuna DDV
                    </div>
                    <div className="text-sm text-green-900">
                      Če imate samo znesek brez DDV (npr. <span className="font-mono bg-white rounded px-1 py-0.5">43,30</span> €), potem DDV = <span className="font-mono">43,30 × 0,22 = <span className="font-bold text-green-700">9,53 €</span></span>
                    </div>
                  </div>

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
    </div>
  );
}