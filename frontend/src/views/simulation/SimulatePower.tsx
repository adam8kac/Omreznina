import { useEffect, useState } from 'react';
import { auth } from 'src/firebase-config';
import {
  getAvailableDevices,
  simulateUsage,
  getAgreedPowers,
  SimulationRequest,
  getKiloWattHourPrice,
  getCurrentTariff,
  getToplotnPower,
  getClientTemparature,
  getCurrentWorkinGpowerToplotna,
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
import '../../css/theme/accordion.css';

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
  const [tariff, setTariff] = useState<string | null>(null);
  const [uid, setUid] = useState<string>('');

  const [isToplotnaWorking, setIsToplotnaWorking] = useState(false);
  const [toplotnaPower, setToplotnaPower] = useState('');
  const [toplotnaTemp, setToplotnaTemp] = useState('');
  const [outsideTemp, setOutsideTemp] = useState<number | undefined>();
  const [currentWorkingPower, setCurrentWorkingPower] = useState<number | undefined>();

  useEffect(() => {
    getAvailableDevices().then(setAvailableDevices);
  }, []);

  useEffect(() => {
    const fetchPowers = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        setUid(user.uid);
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

  const getDayType = (): 'DELOVNI_DAN' | 'DELA_PROST_DAN' => {
    return 'DELOVNI_DAN';
  };

  useEffect(() => {
    if (loadingPowers) return;
    const timeout = setTimeout(() => {
      const simulate = async () => {
        if (selectedDevices.length === 0) {
          setResult(null);
          setPriceTariff(0);
          return;
        }
        const request: SimulationRequest = {
          selectedDevices,
          agreedPowers,
          season: 'VISJA',
          dayType: getDayType(),
        };
        const simResult = await simulateUsage(request);

        let totalUsedPower = simResult.totalUsedPower;
        if (currentWorkingPower && currentWorkingPower > 0) {
          totalUsedPower += currentWorkingPower * 1000;
        }
        const powerUsed = totalUsedPower / 1000;

        setResult({
          ...simResult,
          totalUsedPower,
        });

        const simPrice = await getKiloWattHourPrice(powerUsed, uid);
        setPriceTariff(parseFloat(simPrice.toFixed(2)));

        const currentTariff = await getCurrentTariff(uid);
        setTariff(currentTariff.type);
      };
      simulate();
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedDevices, agreedPowers, loadingPowers, currentWorkingPower]);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const toplotnaData = (await getToplotnPower(uid)) as any;
        const temp = Object.values(toplotnaData)[1];
        const currentPower = await getCurrentWorkinGpowerToplotna(uid);
        setCurrentWorkingPower(currentPower);
        if (toplotnaData) {
          setToplotnaPower(toplotnaData?.power?.toString() || '');
          setToplotnaTemp(String(temp));
        }
      } catch (err) {}
    })();
  }, [uid]);

  useEffect(() => {
    (async () => {
      const data = await getClientTemparature();
      setOutsideTemp(data?.temp);
    })();
  }, []);

  function getTotalUsedPowerWithToplotna() {
    if (!result) return 0;
    if (currentWorkingPower && currentWorkingPower > 0) {
      return result.totalUsedPower;
    }
    return result.totalUsedPower;
  }

  useEffect(() => {
    if (currentWorkingPower && currentWorkingPower > 0) {
      setIsToplotnaWorking(true);
    } else {
      setIsToplotnaWorking(false);
    }
  }, [currentWorkingPower]);

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="p-4 space-y-4">
        <h2 className="text-3xl font-bold mb-4 text-center">Izberi naprave</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto text-center">
          Izberite naprave, katerih porabo želite simulirati. Na podlagi izbranih naprav in dogovorjene moči bo prikazan
          rezultat simulacije.
        </p>
        <p className="text-gray-400 text-lg mx-auto text-center">
          Preizkusi različne kombinacije naprav in preveri, ali presegaš dogovorjeno moč.
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
            className={`p-4 rounded-xl mt-6 flex flex-col md:flex-row justify-center items-center gap-8 ${
              getTotalUsedPowerWithToplotna() > result.agreedPower
                ? 'bg-red-100 border border-red-300'
                : 'bg-white shadow-md'
            }`}
          >
            <div className="flex flex-col gap-4 items-center w-full md:w-1/2">
              <div className="text-6xl">
                {getTotalUsedPowerWithToplotna() > result.agreedPower ? (
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
                  Poraba: {getTotalUsedPowerWithToplotna()} W ({(getTotalUsedPowerWithToplotna() / 1000).toFixed(2)} kW)
                  {!!currentWorkingPower && currentWorkingPower > 0 && (
                    <span className="text-sm text-purple-600 ml-2">
                      (vključena poraba toplotne črpalke: +{currentWorkingPower} kW)
                    </span>
                  )}
                </p>

                <p>
                  Status:{' '}
                  <span
                    className={getTotalUsedPowerWithToplotna() > result.agreedPower ? 'text-red-600' : 'text-green-600'}
                  >
                    {getTotalUsedPowerWithToplotna() > result.agreedPower ? 'PREKORAČITEV' : 'V REDU'}
                  </span>
                </p>

                <p>Za vsako uro s takšno porabo boste plačali približno: {priceTariff}€ zaradi tarife.</p>
                {getTotalUsedPowerWithToplotna() > result.agreedPower && (
                  <>
                    <p>
                      Zaradi takšne moči boste plačali po 15 minutah kazen v približnem znesku:{' '}
                      {(
                        result.timeBlockPrice *
                        ((getTotalUsedPowerWithToplotna() - result.agreedPower) / 1000)
                      ).toFixed(2)}
                      €
                    </p>
                    <p>
                      Približni skupni stroški:{' '}
                      {(
                        priceTariff +
                        result.timeBlockPrice * ((getTotalUsedPowerWithToplotna() - result.agreedPower) / 1000)
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
                  colors:
                    getTotalUsedPowerWithToplotna() > result.agreedPower
                      ? ['#f87171', '#dc2626']
                      : ['#6366f1', '#10b981'],
                  dataLabels: { enabled: false },
                  tooltip: { y: { formatter: (val: number) => `${val} kW` } },
                }}
                series={[
                  {
                    name: 'Moč',
                    data: [result.agreedPower / 1000, getTotalUsedPowerWithToplotna() / 1000],
                  },
                ]}
              />
            </div>
          </div>
        )}

        <div className="mt-6 text-purple-600 text-sm text-center">
          {isToplotnaWorking ? (
            <p className="font-medium">
              Toplotna črpalka se lahko avtomatsko vklopi, ker je zunanja temperatura približno {outsideTemp ?? 'X'}°C.
              <br />
              Vi imate nastavljen vklop toplotne črpalke pri {toplotnaTemp} °C. Vaša nastavljena poraba toplotne črpalke
              je {toplotnaPower} kW.
            </p>
          ) : (
            <p className="font-medium">
              Trenutno ni verjetnosti, da bi se toplotna črpalka vklopila – zunanja temperatura je {outsideTemp ?? 'X'}
              °C.
            </p>
          )}
        </div>

        <div className="mt-8 bg-white p-4 rounded-xl">
          <Accordion collapseAll>
            <Accordion.Panel>
              <Accordion.Title>Kaj pomeni obračunska moč?</Accordion.Title>
              <Accordion.Content>
                <div className="accordion-content-transition">
                  <p className="text-sm text-gray-700">
                    Obračunska moč je količina električne moči, ki jo uporabnik zagotovi, da bo potrebna za napajanje
                    svojih naprav v določenem časovnem bloku. Če uporabnik preseže to dogovorjeno moč, lahko plača višjo
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
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default SimulatePower;
