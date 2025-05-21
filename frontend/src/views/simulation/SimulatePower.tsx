import { useEffect, useState } from 'react';
import {getAvailableDevices,simulateUsage,SimulationRequest} from 'src/index';
import Chart from 'react-apexcharts';
import { MdIron } from 'react-icons/md';
import {FaTv, FaLaptop, FaFan, FaSnowflake,FaShower, FaTshirt, FaPlug, FaUtensils, FaDesktop, FaFrown, FaSmile} from 'react-icons/fa';

const deviceIcons: Record<string, JSX.Element> = {
  'Sušilni stroj': <FaTshirt />, 'Bojler': <FaShower />, 'Električni štedilnik': <FaUtensils />,
  'Likalnik': <MdIron />, 'Pečica': <FaPlug />, 'Fen': <FaFan />, 'Klima': <FaSnowflake />,
  'Pomivalni stroj': <FaUtensils />, 'Pralni stroj': <FaTshirt />, 'TV': <FaTv />,
  'Računalnik': <FaDesktop />, 'Prenosnik': <FaLaptop />
};

const devicePowerMap: Record<string, number> = {
  'Sušilni stroj': 4000, 'Bojler': 3500, 'Električni štedilnik': 3000,
  'Likalnik': 2200, 'Pečica': 2000, 'Fen': 1500, 'Klima': 1500,
  'Pomivalni stroj': 1000, 'Pralni stroj': 800,
  'TV': 400, 'Računalnik': 300, 'Prenosnik': 100
};

export const SimulatePower = () => {
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    getAvailableDevices().then(setAvailableDevices);
  }, []);

  const handleSimulate = async () => {
    const request: SimulationRequest = {
      selectedDevices: selectedDevices,
      agreedPowers: {
        1: 5000,
        2: 4000,
        3: 3500,
        4: 3000,
        5: 2000
      },
      season: 'VISJA',
      dayType: 'DELOVNI_DAN'
    };

    const simResult = await simulateUsage(request);
    setResult(simResult);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Izberi naprave</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableDevices.filter(device => devicePowerMap[device] !== undefined).map((device) => (
          <button
            key={device}
            className={`flex items-center space-x-2 p-2 border rounded-xl transition-all ${
              selectedDevices.includes(device)
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() =>
              setSelectedDevices((prev) =>
                prev.includes(device)
                  ? prev.filter((d) => d !== device)
                  : [...prev, device]
              )
            }
          >
            <span className="text-lg">{deviceIcons[device] || <FaPlug />}</span>
            <span>{device} ({(devicePowerMap[device] / 1000).toFixed(2)} kW)</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSimulate}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
      >
        Simuliraj porabo
      </button>

      {result && (
        <div className={`p-4 rounded-xl mt-6 flex flex-col md:flex-row justify-center items-center gap-8 ${result.status === 'PREKORAČITEV' ? 'bg-red-100 border border-red-300' : 'bg-white shadow-md'}`}>
          <div className="flex flex-col gap-4 items-center w-full md:w-1/2">
            <div className="text-6xl">
              {result.status === 'PREKORAČITEV' ? <FaFrown className="text-red-500" /> : <FaSmile className="text-green-500" />}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Rezultat simulacije</h3>
              <p>Blok: {result.currentBlock}</p>
              <p>Dogovorjena moč: {result.agreedPower} W ({result.agreedPower / 1000} kW)</p>
              <p>Poraba: {result.totalUsedPower} W ({result.totalUsedPower / 1000} kW)</p>
              <p>
                Status:{' '}
                <span className={result.status === 'PREKORAČITEV' ? 'text-red-600' : 'text-green-600'}>
                  {result.status}
                </span>
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <Chart
              type="bar"
              height={320}
              options={{
                chart: { id: 'power-simulation', toolbar: { show: false } },
                plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' } },
                xaxis: {
                  categories: ['Dogovorjena moč', 'Poraba']
                },
                yaxis: {
                  labels: {
                    formatter: (val: number) => `${val} kW`
                  }
                },
                colors: result.status === 'PREKORAČITEV' ? ['#f87171', '#dc2626'] : ['#6366f1', '#10b981'],
                dataLabels: { enabled: false },
                tooltip: { y: { formatter: (val: number) => `${val} kW` } }
              }}
              series={[{
                name: 'Moč',
                data: [result.agreedPower / 1000, result.totalUsedPower / 1000]
              }]}
            />
          </div>
        </div>
      )}

      {result?.maybeActivatedDevices && result.maybeActivatedDevices.length > 0 && (
        <div className="mt-6 text-purple-600 text-sm text-center">
          <p className="font-medium">
            Pozor: Možen je samodejni vklop naprav kot je npr. toplotna črpalka (~2 kW).
          </p>
        </div>
      )}
    </div>
  );
};

export default SimulatePower;