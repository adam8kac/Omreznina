import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Spinner, Select } from 'flowbite-react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  getSubcollectionDocsConsumption,
  getSubcollectionsConsumption,
  getDocumentDataConsumption,
} from 'src/index';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface DayRecord {
  poraba: number;
  solar: number;
}

interface ParsedMonth {
  totalPoraba: number;
  totalSolar: number;
  totalPrejeta: number;
  dni: Array<[string, DayRecord]>;
  tarifaShare?: string;
}

const formatMonth = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' });
};

const MonthlyConsumptionChart = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
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
        const monthsList = await getSubcollectionsConsumption(uid, 'poraba');
        const parsed: Record<string, ParsedMonth> = {};

        for (const month of monthsList) {
          const days = await getSubcollectionDocsConsumption(uid, 'poraba', month);
          const dni: Array<[string, DayRecord]> = [];

          let sumPoraba = 0;
          let sumSolar = 0;
          let sumPrejeta = 0;

          let et = 0;
          let mt = 0;
          let vt = 0;

          for (const day of days) {
            const data = await getDocumentDataConsumption(uid, 'poraba', month, day);
            const deltaPrejeta = (data['delta prejeta delovna energija et'] ?? 0) as number;
            const deltaOddana = (data['delta oddana delovna energija et'] ?? 0) as number;
            const porabaEt = (data['poraba et'] ?? 0) as number;

            et += data['prejeta delovna energija et'] ?? 0;
            mt += data['prejeta delovna energija mt'] ?? 0;
            vt += data['prejeta delovna energija vt'] ?? 0;

            dni.push([
              day,
              {
                poraba: Math.max(0, deltaPrejeta),
                solar: Math.max(0, deltaOddana),
              },
            ]);

            sumPoraba += porabaEt;
            sumSolar += deltaOddana;
            sumPrejeta += deltaPrejeta;
          }

          const total = et + mt + vt;
          const tarifaShare =
            total > 0
              ? `ET: ${((et / total) * 100).toFixed(1)}%, MT: ${((mt / total) * 100).toFixed(1)}%, VT: ${((vt / total) * 100).toFixed(1)}%`
              : 'Ni podatkov o tarifah';

          parsed[month] = {
            totalPoraba: parseFloat(sumPoraba.toFixed(3)),
            totalSolar: parseFloat(sumSolar.toFixed(3)),
            totalPrejeta: parseFloat(sumPrejeta.toFixed(3)),
            dni,
            tarifaShare,
          };
        }

        const allKeys = Object.keys(parsed).sort();
        const yearSet = Array.from(new Set(allKeys.map((k) => k.split('-')[0])));

        setMonths(allKeys);
        setYears(yearSet);
        setSelectedYear(yearSet[0] ?? '');
        setMonthlyData(parsed);
        setSelectedMonth(allKeys[0] ?? null);
      } catch (e) {
        console.error('[ERROR] Napaka pri fetchu:', e);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  const filteredMonths = months.filter((m) => m.startsWith(selectedYear));

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
      categories: filteredMonths.map(formatMonth),
    },
    yaxis: {
      labels: { formatter: (val) => `${val} kWh` },
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      custom: ({ dataPointIndex, series, seriesIndex }) => {
        const month = filteredMonths[dataPointIndex];
        const val = series[seriesIndex][dataPointIndex];
        const tarifa = monthlyData[month]?.tarifaShare ?? '';

        const name =
          seriesIndex === 0
            ? 'Poraba'
            : seriesIndex === 1
            ? 'Oddana energija'
            : 'Prejeta energija';

        return `
          <div style="padding: 8px">
            <b>${formatMonth(month)}</b><br/>
            <span style="color: ${seriesIndex === 2 ? '#3b82f6' : seriesIndex === 1 ? '#facc15' : '#10b981'}; font-weight: bold">
              ${name} (kWh): ${val.toFixed(2)}</span><br/>
            ${seriesIndex === 2 ? `<span style="font-size: 12px; color: #666">${tarifa}</span>` : ''}
          </div>
        `;
      },
    },
    legend: { show: true },
  };

  const optionsDailyChart: ApexOptions = {
    chart: { animations: { speed: 500 }, toolbar: { show: false } },
    colors: ['#3b82f6', '#facc15'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: selectedMonth && monthlyData[selectedMonth] ? monthlyData[selectedMonth].dni.map(([dan]) => dan) : [],
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
          Vaš najbolj potraten dan je bil <strong>{max[0]}</strong>, ko ste porabili <strong>{max[1].poraba.toFixed(2)} kWh</strong>. Najbolj varčen dan je bil <strong>{min[0]}</strong>, s porabo <strong>{min[1].poraba.toFixed(2)} kWh</strong>.
        </p>
        <p className="mb-2">
          Skupaj ste v mesecu <strong>{formatMonth(selectedMonth)}</strong> porabili <strong>{totalPoraba.toFixed(2)} kWh</strong> električne energije.
          {totalSolar > 0 && (<> Vaša sončna elektrarna je proizvedla <strong>{totalSolar.toFixed(2)} kWh</strong>.</>)}
        </p>
        <p>
          Poskusite zmanjšati porabo v konicah. Ugasnite naprave v pripravljenosti in optimizirajte uporabo velikih porabnikov (npr. pralni stroj) v času sončne proizvodnje.
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
        <div className="text-gray-600">
          Ni podatkov za prikaz.<br />
          <span className="text-blue-600 underline cursor-pointer">
            Obiščite podstran »Naloži podatke« in jih dodajte.
          </span>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <h5 className="card-title">Prikaz mesečne porabe</h5>
            {years.length > 1 && (
              <div className="flex gap-2 items-center">
                <label htmlFor="leto">Izberi leto:</label>
                <Select id="leto" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="max-w-[150px]">
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <Chart
            options={optionsBarChart}
            series={[
              {
                name: 'Poraba (kWh)',
                data: filteredMonths.map((m) => monthlyData[m]?.totalPoraba ?? 0),
              },
              {
                name: 'Oddana energija (kWh)',
                data: filteredMonths.map((m) => monthlyData[m]?.totalSolar ?? 0),
              },
              {
                name: 'Prejeta energija (kWh)',
                data: filteredMonths.map((m) => monthlyData[m]?.totalPrejeta ?? 0),
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Poraba po dnevih za mesec {formatMonth(selectedMonth)}</h2>
                <Select
                  value={selectedMonth ?? ''}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="max-w-[200px]"
                >
                  {filteredMonths.map((month) => (
                    <option key={month} value={month}>
                      {formatMonth(month)}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Modra linija prikazuje prejeta energijo iz omrežja, rumena pa oddano energijo iz sončne elektrarne.
              </p>

              <Chart
                options={optionsDailyChart}
                series={[
                  {
                    name: 'Prejeta energija (kWh)',
                    data: monthlyData[selectedMonth].dni.map(([_, e]) => e.poraba),
                  },
                  {
                    name: 'Oddana solarna (kWh)',
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
