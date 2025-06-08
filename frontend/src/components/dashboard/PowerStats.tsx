import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getDocumentDataConsumption, getSubcollectionDocsConsumption, getSubcollectionsConsumption } from 'src/index';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { Accordion, Spinner } from 'flowbite-react';
import '../../css/theme/accordion.css';

const formatEUR = (value: any) => `${parseFloat(value || 0).toFixed(2)} €`;
const formatKW = (value: any) => `${parseFloat(value || 0).toFixed(1)} kW`;

const BlockPricePieChart = ({
  blockNumber,
  totalCost,
  excessCost,
}: {
  blockNumber: number;
  totalCost: number;
  excessCost: number;
}) => {
  const optimalCost = totalCost - excessCost;
  const blockColors: Record<number, string> = {
    1: '#60A5FA',
    2: '#7DD3FC',
    3: '#6EE7B7',
    4: '#FCD34D',
    5: '#FCA5A5',
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white w-full max-w-xs">
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
        <p>
          <strong>Plačilo ob upoštevanju priporočil:</strong> {formatEUR(optimalCost)}
        </p>
        <p>
          <strong>Presežek plačila:</strong> {formatEUR(excessCost)}
        </p>
        <p>
          <strong>Plačali ste:</strong> {formatEUR(totalCost)}
        </p>
      </div>
    </div>
  );
};

const PowerComparisonTable = ({
  chartData,
  prekoracitveData,
  optimumData,
}: {
  chartData: any[];
  prekoracitveData: Record<string, any>;
  optimumData: Record<string, any>;
}) => {
  const totalExcess = [1, 2, 3, 4].reduce(
    (sum, block) => sum + chartData.reduce((daySum, day) => daySum + (day[`b${block}_excess`] || 0), 0),
    0
  );
  const paid = parseFloat(prekoracitveData?.['total monthly price'] ?? 0);
  const optimal = parseFloat(optimumData?.['total monthly price'] ?? 0);
  const overpaid = paid - optimal;
  console.log(optimumData);
  return (
    <div className="rounded-2xl bg-white border border-gray-200 text-sm overflow-hidden divide-y divide-gray-100">
      <div className="sm:grid sm:grid-cols-2 bg-blue-500/10 text-gray-700 font-medium flex flex-col">
        <div className="flex justify-between sm:justify-center sm:p-4 px-4 py-3 border-b sm:border-b-0">
          <span>Skupna prekoračitev</span>
          <span className="sm:hidden font-medium">{formatKW(totalExcess)}</span>
        </div>
        <div className="flex justify-between sm:justify-center sm:p-4 px-4 py-3 border-b sm:border-b-0">
          <span>Plačano</span>
          <span className="sm:hidden font-medium">{formatEUR(paid)}</span>
        </div>
      </div>
      <div className="hidden sm:grid sm:grid-cols-2 text-center">
        <div className="p-4">{formatEUR(paid)}</div>
        <div className="p-4 text-rose-600 font-semibold">{formatEUR(overpaid)}</div>
      </div>
      <div className="sm:grid sm:grid-cols-2 bg-blue-500/10 text-gray-700 font-medium flex flex-col">
        <div className="flex justify-between sm:justify-center sm:p-4 px-4 py-3">
        <span>Možni prihranek</span>
          <span className="sm:hidden font-semibold text-rose-600">{formatEUR(overpaid)}</span>
        </div>
        <div className="flex justify-between sm:justify-center sm:p-4 px-4 py-3">
          <span>Plačilo ob upoštevanju priporočil</span>
          <span className="sm:hidden">{formatEUR(optimal)}</span>
        </div>
      </div>
      <div className="hidden sm:grid sm:grid-cols-2 text-center">
        <div className="p-4">{formatKW(totalExcess)}</div>
        <div className="p-4">{formatEUR(optimal)}</div>
      </div>
    </div>
  );
};

const PricePieChart = ({ optimum, actual }: { optimum: number; actual: number }) => {
  const excess = Math.max(actual - optimum, 0);
  const normal = actual - excess;

  const formatEUR = (value: number) => `${value.toFixed(2)} €`;

  return (
    <div className="mx-auto mt-8 mb-8 p-4 bg-white w-full max-w-md">
      <h3 className="text-center text-lg font-semibold mb-4">Skupna mesečna poraba</h3>
      <PieChart
        hideLegend
        series={[
          {
            arcLabel: (item) => formatEUR(item.value),
            arcLabelMinAngle: 15,
            outerRadius: 90,
            data: [
              { id: 0, value: normal, label: 'Optimalna poraba', color: '#A78BFA' },
              { id: 1, value: excess, label: 'Prekoračitev', color: 'rgba(255, 0, 0, 0.7)' },
            ],
          },
        ]}
        width={300}
        height={240}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fill: '#000',
            fontSize: 12,
          },
        }}
      />
      <div className="text-sm mt-4 text-center">
        <p>
          <strong>Plačilo ob upoštevanju priporočil:</strong> {formatEUR(optimum)}
        </p>
        <p>
          <strong>Možni prihranek:</strong> {formatEUR(excess)}
        </p>
        <p>
          <strong>Plačano:</strong> {formatEUR(actual)} ({formatEUR(excess)} + {formatEUR(optimum)})
        </p>
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

  const [showSummary] = useState(false);

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
          Niste še naložili podatkov o prekoračitvah. Za prikaz analiz in grafov najprej dodajte vsaj en račun ali CSV
          datoteko s podatki.
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
    <div className="p-6 bg-white space-y-8">
      <div className="w-full max-w-5xl mx-auto mt-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Statistika porabe</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Preglej svojo mesečno porabo elektrike, prekoračitve in možnosti prihrankov na podlagi analiziranih
            podatkov. Uporabi spodnje grafe in tabele za boljše razumevanje in optimizacijo svoje obračunske moči.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start items-end">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Izberi leto</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-lg border border-violet-400 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition min-w-[120px]"
          >
            {years?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Izberi mesec</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-violet-400 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition min-w-[120px]"
          >
            {months?.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <PowerComparisonTable chartData={chartData} prekoracitveData={prekoracitveData} optimumData={optimumData} />

      <PricePieChart
        optimum={parseFloat(optimumData['total monthly price'] || 0)}
        actual={parseFloat(prekoracitveData['total monthly price'] || 0)}
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
      <div className="mt-8 bg-white p-4 rounded-xl">
        <Accordion collapseAll>
          <Accordion.Panel>
            <Accordion.Title>Kaj pomenijo podatki v tabeli?</Accordion.Title>
            <Accordion.Content>
              <div className="accordion-content-transition">
                {[1, 2, 3, 4].map((blockNumber) => {
                  const totalPrice = Number(prekoracitveData?.[blockNumber]?.['total price']);
                  const optimalPrice = Number(optimumData?.[blockNumber]?.['total price']);
                  const excessPrice = totalPrice - optimalPrice;
                  const dataArr = prekoracitveData?.[blockNumber]?.data || [];
                  const optimumArr = optimumData?.[blockNumber]?.data || [];
                  const agreedPower = dataArr[0]?.agreedPower ?? '-';
                  const optimalAgreedPower = optimumArr[0]?.agreedPower ?? '-';
                  if (!totalPrice || !optimalPrice) return null;
                  return (
                    <div key={blockNumber} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <p className="mb-2">
                        V bloku: <b>{blockNumber}</b> ste plačali <b>{totalPrice.toFixed(2)} €</b>, saj imate zakupljenih{' '}
                        <b>{agreedPower} kW</b> dogovorjene moči.
                      </p>
                      <p className="mb-2">
                        To pomeni da ste preplačali <b>{excessPrice.toFixed(2)} €</b>, in bi lahko plačali{' '}
                        <b>{optimalPrice.toFixed(2)} €</b>, če bi imeli zakupljenih <b>{optimalAgreedPower} kW</b>.
                      </p>
                    </div>
                  );
                })}
                {(() => {
                  const moneySpent = parseFloat(prekoracitveData?.['total monthly price'] ?? 0);
                  const optimumMoneySpent = parseFloat(optimumData?.['total monthly price'] ?? 0);
                  const formatedDate = selectedMonth && selectedYear ? `${selectedMonth}.${selectedYear}` : '';
                  return (
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      <p className="mb-2">
                        V mesecu: <b>{formatedDate}</b>, ste skupaj plačali <b>{moneySpent}€</b>.
                      </p>
                      <p className="mb-2">
                        To pomeni da ste{' '}
                        <b>
                          preplačali {((moneySpent ?? 0) - (optimumMoneySpent ?? 0)).toFixed(2)}€, in bi lahko palčali{' '}
                          {optimumMoneySpent}€
                        </b>
                        , če bi imeli v vsakem bloku naše priporočene dogovorjene moči.
                      </p>
                    </div>
                  );
                })()}
                <p className="mt-3 text-blue-700 dark:text-blue-400 italic">
                  <b>
                    To ni cena celotnega računa ampak zgolj koliko ste plačali zaradi vaše dogovorjene moči ter 15 minutnih
                    prekoračitev.
                  </b>
                  <br />
                  <br />
                  Naše priporočitve so izračunane glede na vaše naložene podatke, če se bi poraba spremenila, bi se lahko
                  spremenila tudi cena in priporočena dogovorjena moč.
                </p>
              </div>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
  );
};
