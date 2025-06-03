import { getAuth } from 'firebase/auth';
import { Select, Accordion } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getDocumentDataConsumption, getSubcollectionDocsConsumption, getSubcollectionsConsumption } from 'src/index';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';

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
    1: '#fa144d',
    2: '#faa63e',
    3: '#FFD900',
    4: '#2FBE8F',
    5: '#B8D900',
  };

  const formatEUR = (value: number) => `${value.toFixed(2)} €`;

  return (
    <div className="flex flex-col items-center justify-between p-4 bg-white w-full max-w-xs h-full">
      <h3 className="text-center font-semibold mb-2">Blok {blockNumber}</h3>
      <PieChart
        hideLegend
        series={[
          {
            arcLabel: (item) => formatEUR(item.value),
            arcLabelMinAngle: 15,
            outerRadius: 70,
            data: [
              { id: 0, value: optimalCost, label: 'Optimalna poraba', color: `${blockColors[blockNumber]}B3` },
              { id: 1, value: excessCost, label: 'Prekoračitev', color: 'rgba(255, 0, 0, 0.7)' },
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
          <strong>Lahko bi plačali:</strong> {formatEUR(optimalCost)}
        </p>
        <p>
          <strong>Preplačali ste:</strong> {formatEUR(excessCost)}
        </p>
        <p>
          <strong>Plačali ste:</strong>{' '}
          {formatEUR(totalCost) + ' (' + formatEUR(excessCost) + ' + ' + formatEUR(optimalCost) + ')'}
        </p>
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
              { id: 0, value: normal, label: 'Optimalna poraba', color: '#2FBE8F' },
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
          <strong>Lahko bi plačali:</strong> {formatEUR(optimum)}
        </p>
        <p>
          <strong>Preplačali ste:</strong> {formatEUR(excess)}
        </p>
        <p>
          <strong>Plačali ste:</strong>{' '}
          {formatEUR(actual) + ' (' + formatEUR(excess) + ' + ' + formatEUR(optimum) + ')'}
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
  const [formatedDate, setFormatedDate] = useState<string>();
  const [uid, setUid] = useState<string>();
  const [prekoracitveData, setPrekoracitveData] = useState<Record<string, any> | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [optimumData, setOptimumData] = useState<Record<string, any> | null>(null);
  const [moneySpent, setMoneySpent] = useState<number>();
  const [optimumMoneySpent, setOptimumMoneySpent] = useState<number>();
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
    if (!uid || !selectedYear) return;
    getSubcollectionDocsConsumption(uid, 'prekoracitve', selectedYear).then((monthsArr) => {
      setMonths(monthsArr?.sort() || null);
    });
  }, [selectedYear, uid]);

  useEffect(() => {
    if (months?.length) setSelectedMonth(months[0]);
  }, [months]);

  useEffect(() => {
    if (!uid || !selectedYear || !selectedMonth) return;
    getDocumentDataConsumption(uid, 'prekoracitve', selectedYear, selectedMonth).then(setPrekoracitveData);
    getDocumentDataConsumption(uid, 'optimum', selectedYear, selectedMonth).then(setOptimumData);
  }, [uid, selectedYear, selectedMonth]);

  useEffect(() => {
    if (!prekoracitveData) return;
    if (prekoracitveData['total monthly price']) {
      setMoneySpent(prekoracitveData['total monthly price']);
    }
  }, [prekoracitveData]);

  useEffect(() => {
    if (!optimumData) return;
    if (optimumData['total monthly price']) {
      setOptimumMoneySpent(optimumData['total monthly price']);
    }
  }, [optimumData]);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      const monthNames: Record<string, string> = {
        '01': 'Januar',
        '02': 'Februar',
        '03': 'Marec',
        '04': 'April',
        '05': 'Maj',
        '06': 'Junij',
        '07': 'Julij',
        '08': 'Avgust',
        '09': 'September',
        '10': 'Oktober',
        '11': 'November',
        '12': 'December',
      };
      setFormatedDate(`${monthNames[selectedMonth] || selectedMonth} ${selectedYear}`);
    }
  }, [selectedMonth, selectedYear]);

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

  return (
    <div className="p-4 bg-white">
      <div className="mb-4">
        <label className="block mb-1">Izberi leto:</label>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years?.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6">
        <label className="block mb-1">Izberi mesec:</label>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months?.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </Select>
      </div>

      {formatedDate && <h2 className="text-xl font-bold mb-6">Pregled porabe po blokih – {formatedDate}</h2>}

      {chartData.length > 0 && moneySpent && optimumMoneySpent ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
            {[1, 2, 3, 4].map((blockNumber) => {
              const normalSum = chartData.reduce((sum, day) => sum + (day[`b${blockNumber}_normal`] || 0), 0);
              const excessSum = chartData.reduce((sum, day) => sum + (day[`b${blockNumber}_excess`] || 0), 0);
              const totalPower = normalSum + excessSum;

              const totalMonthlyPower = chartData.reduce(
                (sum, day) =>
                  sum +
                  [1, 2, 3, 4, 5].reduce((s, b) => s + (day[`b${b}_normal`] || 0) + (day[`b${b}_excess`] || 0), 0),
                0
              );

              if (!totalPower || !totalMonthlyPower) return null;

              return (
                <BlockPricePieChart
                  key={blockNumber}
                  blockNumber={blockNumber}
                  totalCost={Number(prekoracitveData?.[blockNumber]?.['total price'])}
                  excessCost={
                    Number(prekoracitveData?.[blockNumber]?.['total price']) -
                    Number(optimumData?.[blockNumber]?.['total price'])
                  }
                />
              );
            })}
          </div>

          <PricePieChart optimum={optimumMoneySpent} actual={moneySpent} />
        </>
      ) : (
        <p className="text-gray-500">Ni podatkov za prikaz.</p>
      )}
      <Accordion collapseAll className="mt-4 border rounded-lg">
        <Accordion.Panel>
          <Accordion.Title className="text-blue-700 dark:text-blue-400">
            {showSummary ? 'Skrij razlago vaših podatkov' : 'Prikaži razlago vaših podatkov'}
          </Accordion.Title>
          <Accordion.Content className="bg-gray-50 dark:bg-gray-900">
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
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="mb-2">
                V mesecu: <b>{formatedDate}</b>, ste skupaj plačali <b>{moneySpent}€</b>.
              </p>
              <p className="mb-2">
                To pomeni da ste{' '}
                <b>
                  preplačali {(moneySpent ?? 0) - (optimumMoneySpent ?? 0)}€, in bi lahko palčali {optimumMoneySpent}€
                </b>
                , če bi imeli v vsakem bloku naše priporočene dogovorjene moči.
              </p>
            </div>
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
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>
    </div>
  );
};
