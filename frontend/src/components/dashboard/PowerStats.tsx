import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  getDocumentDataConsumption,
  getSubcollectionDocsConsumption,
  getSubcollectionsConsumption,
} from 'src/index';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { Spinner } from 'flowbite-react';

const formatEUR = (value: any) => `${parseFloat(value || 0).toFixed(2)} €`;
const formatKW = (value: any) => `${parseFloat(value || 0).toFixed(1)} kW`;

const BlockPricePieChart = ({ blockNumber, totalCost, excessCost }: {
  blockNumber: number;
  totalCost: number;
  excessCost: number;
}) => {
  const optimalCost = totalCost - excessCost;
  const blockColors: Record<number, string> = {
    1: '#fa144d',
    2: '#faa63e',
    3: '#FFD900',
    4: '#2FBE8F',
    5: '#B8D900',
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-2xl shadow bg-white w-full max-w-xs">
      <h3 className="text-center font-semibold mb-2 text-lg">Blok {blockNumber}</h3>
      <PieChart
        hideLegend
        series={[
          {
            arcLabel: (item) => formatEUR(item.value),
            arcLabelMinAngle: 15,
            outerRadius: 70,
            data: [
              { id: 0, value: optimalCost, label: 'Optimalna poraba', color: `${blockColors[blockNumber]}B3` },
              { id: 1, value: excessCost, label: 'Prekoračitve', color: 'rgba(255, 0, 0, 0.7)' },
            ],
          },
        ]}
        width={200}
        height={180}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fill: '#000',
            fontSize: 12,
          },
        }}
      />
      <div className="text-sm mt-3 text-center">
        <p><strong>Dogovorjena poraba:</strong> {formatEUR(optimalCost)}</p>
        <p><strong>Prekoračitve:</strong> {formatEUR(excessCost)}</p>
        <p><strong>Skupaj plačano:</strong> {formatEUR(totalCost)}</p>
      </div>
    </div>
  );
};

const PowerComparisonTable = ({ chartData, prekoracitveData, optimumData }: {
  chartData: any[];
  prekoracitveData: Record<string, any>;
  optimumData: Record<string, any>;
}) => {
  const totalExcess = [1, 2, 3, 4].reduce(
    (sum, block) =>
      sum + chartData.reduce((daySum, day) => daySum + (day[`b${block}_excess`] || 0), 0),
    0
  );
  const paid = parseFloat(prekoracitveData?.['total monthly price'] ?? 0);
  const optimal = parseFloat(optimumData?.['total monthly price'] ?? 0);
  const overpaid = paid - optimal;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="grid grid-cols-3 text-sm bg-gray-50 text-gray-700 font-semibold">
        <div className="p-4 border-r">Skupna prekoračitev</div>
        <div className="p-4 border-r">Plačali ste</div>
        <div className="p-4">Preplačali ste</div>
      </div>
      <div className="grid grid-cols-3 text-center text-sm">
        <div className="p-4 border-t">{formatKW(totalExcess)}</div>
        <div className="p-4 border-t">{formatEUR(paid)}</div>
        <div className="p-4 border-t text-red-600 font-bold">{formatEUR(overpaid)}</div>
      </div>

      <div className="grid grid-cols-2 text-sm bg-gray-50 text-gray-700 font-semibold mt-6">
        <div className="p-4 border-r">Optimum dogovorjene moči za vas</div>
        <div className="p-4">Bi plačali z dogovorjeno močjo</div>
      </div>
      <div className="grid grid-cols-2 text-center text-sm">
        <div className="p-4 border-t">{formatKW(totalExcess)}</div>
        <div className="p-4 border-t">{formatEUR(optimal)}</div>
      </div>
    </div>
  );
};

export const PowerStats = () => {
  const [years, setYears] = useState<string[] | null>(null);
  const [months, setMonths] = useState<string[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [uid, setUid] = useState<string>();
  const [prekoracitveData, setPrekoracitveData] = useState<Record<string, any> | null>(null);
  const [optimumData, setOptimumData] = useState<Record<string, any> | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setUid(user.uid);
  }, []);

  useEffect(() => {
    if (!uid) return;
    getSubcollectionsConsumption(uid, 'prekoracitve').then(setYears);
  }, [uid]);

  useEffect(() => {
    if (years?.length && !selectedYear) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  useEffect(() => {
    if (!uid || !selectedYear) return;
    getSubcollectionDocsConsumption(uid, 'prekoracitve', selectedYear).then((monthsArr) => {
      setMonths(monthsArr?.sort() || null);
    });
  }, [selectedYear, uid]);

  useEffect(() => {
    if (months?.length && !selectedMonth) setSelectedMonth(months[0]);
  }, [months, selectedMonth]);

  useEffect(() => {
    if (!uid || !selectedYear || !selectedMonth) return;
    getDocumentDataConsumption(uid, 'prekoracitve', selectedYear, selectedMonth).then(setPrekoracitveData);
    getDocumentDataConsumption(uid, 'optimum', selectedYear, selectedMonth).then(setOptimumData);
  }, [uid, selectedYear, selectedMonth]);

  useEffect(() => {
    if (!prekoracitveData) return;
    const dayMap: Record<string, any> = {};

    Object.entries(prekoracitveData).forEach(([key, entry]) => {
      if (key === 'total monthly price') return;

      if (typeof entry === 'object' && entry !== null && Array.isArray(entry.data)) {
        entry.data.forEach((item: any) => {
          const day = item.timestamp?.split('-')[0];
          const blockNum = item.block;
          const total = parseFloat(item.maxPowerRecieved);
          const delta = parseFloat(item['delta power']);
          const normal = total - delta;

          if (!dayMap[day]) dayMap[day] = { day };

          dayMap[day][`b${blockNum}_normal`] = (dayMap[day][`b${blockNum}_normal`] || 0) + normal;
          if (delta > 0) {
            dayMap[day][`b${blockNum}_excess`] = (dayMap[day][`b${blockNum}_excess`] || 0) + delta;
          }
        });
      }
    });

    setChartData(Object.values(dayMap).sort((a, b) => Number(a.day) - Number(b.day)));
  }, [prekoracitveData]);

  useEffect(() => {
  if (prekoracitveData && optimumData && chartData.length) {
    setIsLoading(false);
  }
}, [prekoracitveData, optimumData, chartData]);

  if (!uid || !years || !months || !selectedMonth || !selectedYear) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner aria-label="Nalaganje..." size="xl" />
      </div>
    );
  }

  if (isLoading) {
  return (
    <div className="flex justify-center items-center h-40">
      <Spinner size="xl" />
    </div>
  );
}

  if (!months.length || !chartData.length || !prekoracitveData || !optimumData) {
    return (
      <div className="flex flex-col items-center py-16">
        <svg width={50} height={50} viewBox="0 0 24 24" fill="none" className="mb-4 text-blue-500">
          <path
            d="M3 6a1 1 0 0 1 1-1h1V4a1 1 0 1 1 2 0v1h8V4a1 1 0 1 1 2 0v1h1a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 0v14h14V6H5Zm2 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm5 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM7 18h10v-2H7v2Z"
            fill="currentColor"
          />
        </svg>
        <div className="text-lg font-semibold mb-2">Ni podatkov za prikaz</div>
        <div className="text-gray-600 mb-6 text-center max-w-xs">
          Niste še naložili podatkov o prekoračitvah. Za prikaz analiz in grafov najprej dodajte vsaj en račun ali CSV datoteko s podatki.
        </div>
        <a
          href="/upload-data"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
        >
          Naloži podatke
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium text-gray-700">Izberi leto</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2 bg-white shadow-sm text-sm"
          >
            {years?.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium text-gray-700">Izberi mesec</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2 bg-white shadow-sm text-sm"
          >
            {months?.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <PowerComparisonTable
        chartData={chartData}
        prekoracitveData={prekoracitveData}
        optimumData={optimumData}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
        {[1, 2, 3, 4].map((blockNumber) => {
          const totalCost = Number(prekoracitveData?.[blockNumber]?.['total price']);
          const optimalCost = Number(optimumData?.[blockNumber]?.['total price']);
          const excessCost = totalCost - optimalCost;

          if (!totalCost || !optimalCost) return null;

          return (
            <BlockPricePieChart
              key={blockNumber}
              blockNumber={blockNumber}
              totalCost={totalCost}
              excessCost={excessCost}
            />
          );
        })}
      </div>
    </div>
  );
};