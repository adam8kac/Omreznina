import { useEffect, useState } from 'react';
import { auth } from 'src/firebase-config';
import {
  getAvailableDevices,
  simulateUsage,
  getAgreedPowers,
  SimulationRequest,
  getKiloWattHourPrice,
  getCurrentTariff,
} from 'src/index';
import Chart from 'react-apexcharts';
import { MdIron } from 'react-icons/md';
import {
  FaTv,
  FaLaptop,
  FaFan,
  FaSnowflake,
  FaShower,
  FaTshirt,
  FaPlug,
  FaUtensils,
  FaDesktop,
  FaFrown,
  FaSmile,
} from 'react-icons/fa';
import { Accordion } from 'flowbite-react';
import instructions1 from '../../assets/images/instructions/instructions1.png';
import instructions3 from '../../assets/images/instructions/instructions3.png';

const deviceIcons: Record<string, JSX.Element> = {
  'Sušilni stroj': <FaTshirt />,
  'Bojler': <FaShower />,
  'Električni štedilnik': <FaUtensils />,
  'Likalnik': <MdIron />,
  'Pečica': <FaPlug />,
  'Fen': <FaFan />,
  'Klima': <FaSnowflake />,
  'Pomivalni stroj': <FaUtensils />,
  'Pralni stroj': <FaTshirt />,
  'TV': <FaTv />,
  'Računalnik': <FaDesktop />,
  'Prenosnik': <FaLaptop />,
};

const devicePowerMap: Record<string, number> = {
  'Sušilni stroj': 4000,
  'Bojler': 3500,
  'Električni štedilnik': 3000,
  'Likalnik': 2200,
  'Pečica': 2000,
  'Fen': 1500,
  'Klima': 1500,
  'Pomivalni stroj': 1000,
  'Pralni stroj': 800,
  'TV': 400,
  'Računalnik': 300,
  'Prenosnik': 100,
};

export const SimulatePower = () => {
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [agreedPowers, setAgreedPowers] = useState<Record<number, number>>({});
  const [loadingPowers, setLoadingPowers] = useState(true);
  const [priceTariff, setPriceTariff] = useState<number>(0);
  const [tariff, setTariff] = useState(null);

  useEffect(() => {
    getAvailableDevices().then(setAvailableDevices);
  }, []);

  useEffect(() => {
    const fetchPowers = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const data = await getAgreedPowers(user.uid);
        const defaultPowers = { 1: 4000, 2: 4000, 3: 4000, 4: 4000, 5: 4000 };
        setAgreedPowers({ ...defaultPowers, ...data });
      } catch (err) {
        setAgreedPowers({ 1: 4000, 2: 4000, 3: 4000, 4: 4000, 5: 4000 });
      } finally {
        setLoadingPowers(false);
      }
    };
    fetchPowers();
  }, []);

  useEffect(() => {
    if (loadingPowers) return;
    const timeout = setTimeout(() => {
      const simulate = async () => {
        if (selectedDevices.length === 0) {
          setResult(null);
          return;
        }
        const request: SimulationRequest = {
          selectedDevices,
          agreedPowers,
          season: 'VISJA',
          dayType: 'DELOVNI_DAN',
        };
        const simResult = await simulateUsage(request);
        setResult(simResult);

        const totalUsedPower = simResult.totalUsedPower;
        const powerUsed = totalUsedPower / 1000;
        const simPrice = await getKiloWattHourPrice(powerUsed);
        setPriceTariff(parseFloat(simPrice.toFixed(2)));

        const currentTariff = await getCurrentTariff();
        setTariff(currentTariff.type);
      };
      simulate();
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedDevices, agreedPowers, loadingPowers]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-3xl font-bold mb-4 text-center">Izberi naprave</h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto text-center">
        Izberite naprave, katerih porabo želite simulirati. Na podlagi izbranih naprav in dogovorjene moči bo prikazan
        rezultat simulacije.
        <p className="text-gray-400 text-lg">
          Preizkusi različne kombinacije naprav in preveri, ali presegaš dogovorjeno moč.
        </p>
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableDevices
          .filter((device) => devicePowerMap[device] !== undefined)
          .map((device) => (
            <button
              key={device}
              className={`flex items-center space-x-2 p-2 border rounded-xl transition-all ${selectedDevices.includes(device) ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-gray-100'}`}
              onClick={() =>
                setSelectedDevices((prev) =>
                  prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]
                )
              }
            >
              <span className="text-lg">{deviceIcons[device] || <FaPlug />}</span>
              <span>
                {device} ({(devicePowerMap[device] / 1000).toFixed(2)} kW)
              </span>
            </button>
          ))}
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl mt-6 flex flex-col md:flex-row justify-center items-center gap-8 ${result.status === 'PREKORAČITEV' ? 'bg-red-100 border border-red-300' : 'bg-white shadow-md'}`}
        >
          <div className="flex flex-col gap-4 items-center w-full md:w-1/2">
            <div className="text-6xl">
              {result.status === 'PREKORAČITEV' ? (
                <FaFrown className="text-red-500" />
              ) : (
                <FaSmile className="text-green-500" />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Rezultat simulacije</h3>
              <p>Blok: {result.currentBlock}</p>
              <p>Tarifa: {tariff}</p>
              <p>
                Dogovorjena moč: {result.agreedPower} W ({result.agreedPower / 1000} kW)
              </p>
              <p>
                Poraba: {result.totalUsedPower} W ({result.totalUsedPower / 1000} kW)
              </p>
              <p>
                Status:{' '}
                <span className={result.status === 'PREKORAČITEV' ? 'text-red-600' : 'text-green-600'}>
                  {result.status}
                </span>
              </p>
              <p>Za vsako uro s takšno porabo boste plačali približno: {priceTariff}€ zardi tarife.</p>
              {result.totalUsedPower > result.agreedPower && (
                <>
                  <p>
                    Zaradi takšne moči boste plačali po 15 minutah kazen v približnem znesku:{' '}
                    {(result.timeBlockPrice * ((result.totalUsedPower - result.agreedPower) / 1000)).toFixed(2)}€
                  </p>
                  <p>
                    Približni skupni stroški:{' '}
                    {(
                      priceTariff +
                      result.timeBlockPrice * ((result.totalUsedPower - result.agreedPower) / 1000)
                    ).toFixed(2)}
                    €
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <Chart
              type="bar"
              height={320}
              options={{
                chart: { id: 'power-simulation', toolbar: { show: false } },
                plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' } },
                xaxis: { categories: ['Dogovorjena moč', 'Poraba'] },
                yaxis: { labels: { formatter: (val: number) => `${val} kW` } },
                colors: result.status === 'PREKORAČITEV' ? ['#f87171', '#dc2626'] : ['#6366f1', '#10b981'],
                dataLabels: { enabled: false },
                tooltip: { y: { formatter: (val: number) => `${val} kW` } },
              }}
              series={[{ name: 'Moč', data: [result.agreedPower / 1000, result.totalUsedPower / 1000] }]}
            />
          </div>
        </div>
      )}

      <div className="mt-6 text-purple-600 text-sm text-center">
        <p className="font-medium">Pozor: Možen je samodejni vklop naprav kot je npr. toplotna črpalka (~2 kW).</p>
      </div>

      <div className="mt-8 bg-white p-4 rounded-xl">
        <Accordion collapseAll>
          <Accordion.Panel>
            <Accordion.Title>Kaj pomeni obračunska moč?</Accordion.Title>
            <Accordion.Content>
              <p className="text-sm text-gray-700">
                Obračunska moč je količina električne moči, ki jo uporabnik zagotovi, da bo potrebna za napajanje svojih
                naprav v določenem časovnem bloku. Če uporabnik preseže to dogovorjeno moč, lahko plača višjo
                omrežninsko tarifo.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Na spodnjih slikah si lahko ogledate postopek, kako preveriti svojo obračunsko moč na portalu{' '}
                <a
                  href="https://mojelektro.si"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  mojelektro.si
                </a>
                :
              </p>
              <div className="mt-4 space-y-4">
                <img src={instructions1} alt="Koraki 1–2" className="rounded-md border shadow-sm" />
                <img src={instructions3} alt="Koraki 3–6" className="rounded-md border shadow-sm" />
              </div>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
  );
};

export default SimulatePower;
