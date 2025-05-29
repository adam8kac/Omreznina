import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Spinner, Select, Accordion } from 'flowbite-react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  getSubcollectionsConsumption,
  getSubcollectionDocsConsumption,
  getDocumentDataConsumption,
} from 'src/index';
import { Link } from 'react-router';

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
  const [showSummary] = useState<boolean>(false);

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
        const monthsList: string[] = await getSubcollectionsConsumption(uid, 'poraba');
        const parsed: Record<string, ParsedMonth> = {};
        const yearSet = new Set<string>();

        for (const month of monthsList) {
          yearSet.add(month.split('-')[0]);

          const days: string[] = await getSubcollectionDocsConsumption(uid, 'poraba', month);
          const dni: Array<[string, DayRecord]> = [];

          let sumPoraba = 0;
          let sumSolar = 0;
          let sumPrejeta = 0;
          let et = 0, mt = 0, vt = 0;

          const dayDataPromises = days.map(async (day: string) => {
            const data = await getDocumentDataConsumption(uid, 'poraba', month, day);
            const deltaPrejeta = Math.max(0, data['delta prejeta delovna energija et'] ?? 0);
            const deltaOddana = Math.max(0, data['delta oddana delovna energija et'] ?? 0);
            const porabaEt = data['poraba et'] ?? 0;

            et += data['prejeta delovna energija et'] ?? 0;
            mt += data['prejeta delovna energija mt'] ?? 0;
            vt += data['prejeta delovna energija vt'] ?? 0;

            dni.push([day, { poraba: deltaPrejeta, solar: deltaOddana }]);
            sumPoraba += porabaEt;
            sumSolar += deltaOddana;
            sumPrejeta += deltaPrejeta;
          });

          await Promise.all(dayDataPromises);

          const total = et + mt + vt;
          const tarifaShare = total > 0
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

        const sortedKeys = Object.keys(parsed).sort();
        const sortedYears = Array.from(yearSet).sort();
        setMonthlyData(parsed);
        setMonths(sortedKeys);
        setYears(sortedYears);
        setSelectedYear(sortedYears[0] ?? '');
        setSelectedMonth(sortedKeys.find((k) => k.startsWith(sortedYears[0])) ?? null);
      } catch (e) {
        console.error('[ERROR] Napaka pri fetchu:', e);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  useEffect(() => {
    const firstMonthInYear = months.find((m) => m.startsWith(selectedYear));
    if (firstMonthInYear) setSelectedMonth(firstMonthInYear);
  }, [selectedYear, months]);

  const filteredMonths = months.filter((m) => m.startsWith(selectedYear));
  const currentMonthData = selectedMonth ? monthlyData[selectedMonth] : null;
  const previousYearSameMonth = selectedMonth
    ? monthlyData[selectedMonth.replace(/^(\d{4})/, (y) => `${+y - 1}`)]
    : null;

  const dailyPorabaValues = currentMonthData?.dni.map(([_, d]) => d.poraba) ?? [];

  const summaryText = currentMonthData ? (() => {
    const totalDays = currentMonthData.dni.length;
    const maxPoraba = Math.max(...dailyPorabaValues);
    const minPoraba = Math.min(...dailyPorabaValues);
    const avgPoraba = currentMonthData.totalPoraba / totalDays;
    const maxDay = currentMonthData.dni.find(([_, d]) => d.poraba === maxPoraba)?.[0];
    const minDay = currentMonthData.dni.find(([_, d]) => d.poraba === minPoraba)?.[0];
    const realUsage = currentMonthData.totalPrejeta - currentMonthData.totalSolar;

    const yearComparison = previousYearSameMonth
      ? `V enakem obdobju prejšnje leto ste porabili ${previousYearSameMonth.totalPoraba.toFixed(2)} kWh, kar je ${
          currentMonthData.totalPoraba > previousYearSameMonth.totalPoraba
            ? 'manj'
            : 'več'
        } kot letos.`
      : null;

    const smartTip = currentMonthData.totalPoraba > 200
      ? '🔌 Nasvet: preglejte največje porabnike in razmislite o preklopu na naprave z manjšo porabo.'
      : '✅ Vaša poraba je bila učinkovita. Nadaljujte s takšnim načinom upravljanja.';

    return (
      <Accordion collapseAll className="mt-4 border rounded-lg">
        <Accordion.Panel>
          <Accordion.Title className="text-blue-700 dark:text-blue-400">
            {showSummary ? 'Skrij razlago vaših podatkov' : 'Prikaži razlago vaših podatkov'}
          </Accordion.Title>
          <Accordion.Content className="bg-gray-50 dark:bg-gray-900">
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="mb-2">V mesecu <strong>{formatMonth(selectedMonth!)}</strong> ste porabili <strong>{currentMonthData.totalPoraba.toFixed(2)} kWh</strong>.</p>
              <p className="mb-2">Največ ste porabili dne <strong>{maxDay}</strong> (<strong>{maxPoraba.toFixed(2)} kWh</strong>), najmanj pa dne <strong>{minDay}</strong> (<strong>{minPoraba.toFixed(2)} kWh</strong>).</p>
              <p className="mb-2">Povprečna dnevna poraba znaša <strong>{avgPoraba.toFixed(2)} kWh</strong>.</p>
              <p className="mb-2">Iz omrežja ste prejeli <strong>{currentMonthData.totalPrejeta.toFixed(2)} kWh</strong>, oddali pa <strong>{currentMonthData.totalSolar.toFixed(2)} kWh</strong>.</p>
              <p className="mb-2">Vaša neto poraba je znašala <strong>{realUsage.toFixed(2)} kWh</strong>.</p>
              {yearComparison && <p className="mb-2">📊 {yearComparison}</p>}
              <p className="mt-3 text-blue-700 dark:text-blue-400 italic">📌 {smartTip}</p>
            </div>
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>
    );
  })() : null;

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
      categories: currentMonthData?.dni.map(([dan]) => dan) ?? [],
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
          <Link to="/upload-data" className="text-blue-600 underline cursor-pointer">
            Obiščite podstran »Naloži podatke« in jih dodajte.
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <h5 className="card-title">Prikaz mesečne porabe</h5>
            {years.length > 1 && (
              <div className="flex gap-2 items-center">
                <label htmlFor="leto">Izberi leto:</label>
                <Select
                  id="leto"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="max-w-[150px]"
                >
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

          {selectedMonth && currentMonthData && (
            <>
              <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-lg font-bold">Poraba po dnevih za {formatMonth(selectedMonth)}</h2>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="max-w-[200px]"
                >
                  {filteredMonths.map((month) => (
                    <option key={month} value={month}>{formatMonth(month)}</option>
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
                    data: currentMonthData.dni.map(([_, e]) => e.poraba),
                  },
                  {
                    name: 'Oddana solarna (kWh)',
                    data: currentMonthData.dni.map(([_, e]) => e.solar),
                  },
                ]}
                type="line"
                height="300px"
                width="100%"
              />

              {summaryText}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyConsumptionChart;