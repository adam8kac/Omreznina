import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Spinner, Select } from 'flowbite-react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getDocumentData, getUserDocIds } from 'src/index';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface DayRecord {
  poraba: number;
  solar: number;
}

interface ParsedMonth {
  totalPoraba: number;
  totalSolar: number;
  dni: Array<[string, DayRecord]>;
}

const formatMonth = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' });
};

const MonthlyConsumptionChart = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<Record<string, ParsedMonth>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setUid(user.uid);
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docIds = await getUserDocIds(uid);
        const parsed: Record<string, ParsedMonth> = {};

        for (const docId of docIds) {
          const rawResponse = await getDocumentData(uid, docId);
          const rawMonth = rawResponse[0];
          if (!rawMonth) continue;

          const dni: Array<[string, DayRecord]> = [];

          for (const [dan, podatki] of Object.entries(rawMonth)) {
            const poraba = (podatki as any)['delta prejeta delovna energija et'] ?? 0;
            const solar = (podatki as any)['delta oddana delovna energija et'] ?? 0;
            dni.push([dan, { poraba, solar }]);
          }

          const totalPoraba = dni.reduce((acc, [, r]) => acc + r.poraba, 0);
          const totalSolar = dni.reduce((acc, [, r]) => acc + r.solar, 0);

          parsed[docId] = {
            totalPoraba: parseFloat(totalPoraba.toFixed(3)),
            totalSolar: parseFloat(totalSolar.toFixed(3)),
            dni,
          };
        }

        const allKeys = Object.keys(parsed);
        setMonths(allKeys);
        setMonthlyData(parsed);
        setSelectedMonth(allKeys[0] ?? null);
      } catch (e) {
        console.error('Napaka pri fetchu:', e);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  const optionsBarChart: ApexOptions = {
    chart: { animations: { speed: 500 }, toolbar: { show: false } },
    colors: ['#10b981', '#facc15', '#3b82f6'],
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: months.map(formatMonth),
    },
    yaxis: {
      labels: { formatter: (val) => `${val} kWh` },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => `${val.toFixed(2)} kWh` },
    },
    legend: { show: true },
  };

  const optionsDailyChart: ApexOptions = {
    chart: { animations: { speed: 500 }, toolbar: { show: false } },
    colors: ['#60a5fa', '#facc15'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories:
        selectedMonth && monthlyData[selectedMonth]
          ? monthlyData[selectedMonth].dni.map(([dan]) => dan)
          : [],
      labels: { rotate: -45 },
    },
    yaxis: {
      labels: { formatter: (val) => `${val} kWh` },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => `${val.toFixed(2)} kWh` },
    },
    legend: { show: true },
  };

  const renderSummary = () => {
    if (!selectedMonth || !monthlyData[selectedMonth]) return null;

    const dni = monthlyData[selectedMonth].dni;
    if (dni.length === 0) return null;

    const max = dni.reduce((a, b) => (a[1].poraba > b[1].poraba ? a : b));
    const min = dni.reduce((a, b) => (a[1].poraba < b[1].poraba ? a : b));

    const { totalPoraba, totalSolar } = monthlyData[selectedMonth];

    return (
      <div className="bg-gray-50 dark:bg-dark rounded-lg p-4 mt-4 border dark:border-gray-700">
        <p className="mb-2">
          Vaš najbolj potraten dan je bil <strong>{max[0]}</strong>, ko ste porabili{' '}
          <strong>{max[1].poraba.toFixed(2)} kWh</strong>. Najbolj varčen dan je bil{' '}
          <strong>{min[0]}</strong>, s porabo <strong>{min[1].poraba.toFixed(2)} kWh</strong>.
        </p>
        <p className="mb-2">
          Skupaj ste v mesecu <strong>{formatMonth(selectedMonth)}</strong> porabili{' '}
          <strong>{totalPoraba.toFixed(2)} kWh</strong> električne energije.
          {totalSolar > 0 && (
            <>
              {' '}
              Vaša sončna elektrarna je proizvedla <strong>{totalSolar.toFixed(2)} kWh</strong>.
            </>
          )}
        </p>
        <p>
          Poskusite zmanjšati porabo v konicah. Ugasnite naprave v pripravljenosti in optimizirajte
          uporabo velikih porabnikov (npr. pralni stroj) v času sončne proizvodnje.
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner aria-label="Nalaganje..." size="xl" />
        </div>
      ) : hasError ? (
        <p className="text-red-600">Napaka pri nalaganju podatkov.</p>
      ) : months.length === 0 ? (
        <p className="text-gray-600">Ni podatkov za prikaz.</p>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <h5 className="card-title">Prikaz mesečne porabe</h5>
            <Select
              value={selectedMonth ?? ''}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="max-w-[200px]"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </Select>
          </div>

          <Chart
            options={optionsBarChart}
            series={[
              {
                name: 'Dejanska poraba (kWh)',
                data: months.map(
                  (m) =>
                    (monthlyData[m]?.totalPoraba ?? 0) - (monthlyData[m]?.totalSolar ?? 0)
                ),
              },
              {
                name: 'Oddana solarna (kWh)',
                data: months.map((m) => monthlyData[m]?.totalSolar ?? 0),
              },
              {
                name: 'Prejeta energija (kWh)',
                data: months.map((m) => monthlyData[m]?.totalPoraba ?? 0),
              },
            ]}
            type="bar"
            height="315px"
            width="100%"
          />

          {selectedMonth && monthlyData[selectedMonth] ? (
            <>
              {monthlyData[selectedMonth].totalSolar > 0 && (
                <div className="flex items-center gap-2 text-yellow-500 mt-6 mb-4">
                  ☀️ Sončna elektrarna zaznana
                </div>
              )}

              <h5 className="card-title mb-2">
                Poraba po dnevih za {formatMonth(selectedMonth)}
              </h5>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Modra linija prikazuje vašo dejansko porabo iz omrežja, rumena pa oddano energijo iz
                sončne elektrarne.
              </p>

              <Chart
                options={optionsDailyChart}
                series={[
                  {
                    name: 'Poraba (kWh)',
                    data: monthlyData[selectedMonth].dni.map(([_, e]) => e.poraba),
                  },
                  {
                    name: 'Solar (kWh)',
                    data: monthlyData[selectedMonth].dni.map(([_, e]) => e.solar),
                  },
                ]}
                type="line"
                height="300px"
                width="100%"
              />

              <div className="mt-4 cursor-pointer" onClick={() => setShowSummary(!showSummary)}>
                <div className="flex items-center text-blue-600 hover:underline gap-1">
                  <span>Želite dodatne informacije?</span>
                  {showSummary ? <HiChevronUp /> : <HiChevronDown />}
                </div>
              </div>

              {showSummary && renderSummary()}
            </>
          ) : (
            <p className="text-gray-600 mt-4">Za izbrani mesec ni dnevnih podatkov.</p>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyConsumptionChart;
