import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Spinner, Select, Accordion } from 'flowbite-react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  getSubcollectionsConsumption,
  getSubcollectionDocsConsumption,
  getDocumentDataConsumption,
  getAgreedPowers,
  saveAgreedPowers,
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
  tarifaET?: number;
  tarifaMT?: number;
  tarifaVT?: number;
}

const formatMonth = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' });
};

const formatDaySl = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('sl-SI', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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
  // const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setUid(user.uid);
  }, []);

useEffect(() => {
  if (!uid) return;

  (async () => {
    try {
      const agreed = await getAgreedPowers(uid);
      if (!agreed) {
        await saveAgreedPowers(uid, { 1: 6.4, 2: 6.4, 3: 6.4, 4: 6.4, 5: 6.4 });
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        await saveAgreedPowers(uid, { 1: 6.4, 2: 6.4, 3: 6.4, 4: 6.4, 5: 6.4 });
      } else {
        console.error('Error fetching agreed powers:', err);
      }
    }
  })();
}, [uid]);

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
          let et = 0,
            mt = 0,
            vt = 0;

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

          const totalTarifa = et + mt + vt;
          parsed[month] = {
            totalPoraba: parseFloat(sumPoraba.toFixed(3)),
            totalSolar: parseFloat(sumSolar.toFixed(3)),
            totalPrejeta: parseFloat(sumPrejeta.toFixed(3)),
            dni,
            tarifaShare:
              totalTarifa > 0
                ? `ET: ${((et / totalTarifa) * 100).toFixed(1)}%, MT: ${((mt / totalTarifa) * 100).toFixed(1)}%, VT: ${((vt / totalTarifa) * 100).toFixed(1)}%`
                : 'Ni podatkov o tarifah',
            tarifaET: totalTarifa > 0 ? (et / totalTarifa) * 100 : 0,
            tarifaMT: totalTarifa > 0 ? (mt / totalTarifa) * 100 : 0,
            tarifaVT: totalTarifa > 0 ? (vt / totalTarifa) * 100 : 0,
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

  const netoOddajaMeseci: Record<string, number> = {};
  filteredMonths.forEach((m) => {
    const data = monthlyData[m];
    const neto = data.totalPrejeta - data.totalSolar;
    if (neto < 0) {
      netoOddajaMeseci[m] = Math.abs(neto);
    }
  });

  const barSeriesPoraba = filteredMonths.map((m) => {
    const data = monthlyData[m];
    const neto = data.totalPrejeta - data.totalSolar;
    return neto < 0 ? null : data.totalPoraba;
  });
  const barSeriesSolar = filteredMonths.map((m) => monthlyData[m].totalSolar);
  const barSeriesPrejeta = filteredMonths.map((m) => monthlyData[m].totalPrejeta);

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
      min: 0,
    },
    tooltip: {
      theme: 'dark',
      shared: false,
      custom: ({ dataPointIndex }) => {
        const month = filteredMonths[dataPointIndex];
        const monthData = monthlyData[month];
        if (!monthData) return '';
        const colors = ['#10b981', '#facc15', '#3b82f6'];
        const names = ['Poraba (kWh)', 'Oddana energija (kWh)', 'Prejeta energija (kWh)'];
        const neto = monthData.totalPrejeta - monthData.totalSolar;
        const porabaDisplay = neto < 0 ? '0.00' : monthData.totalPoraba.toFixed(2);
        const netoInfo =
          neto < 0
            ? `<div style="margin-top:6px; color:#059669; font-weight:bold;">
              Neto oddaja v omrežje: ${Math.abs(neto).toFixed(2)} kWh
            </div>`
            : '';
        return `
          <div style="padding:8px;min-width:210px">
            <b style="font-size:15px">${formatMonth(month)}</b><br/>
            <div style="margin:4px 0">
              <span style="color:${colors[0]};font-weight:bold">${names[0]}:</span>
              <span style="float:right">${porabaDisplay} kWh</span>
            </div>
            <div style="margin:4px 0">
              <span style="color:${colors[1]};font-weight:bold">${names[1]}:</span>
              <span style="float:right">${monthData.totalSolar.toFixed(2)} kWh</span>
            </div>
            <div style="margin:4px 0">
              <span style="color:${colors[2]};font-weight:bold">${names[2]}:</span>
              <span style="float:right">${monthData.totalPrejeta.toFixed(2)} kWh</span>
            </div>
            <hr style="margin:6px 0"/>
            <div>
              <b>Sestava tarif:</b>
              <div style="font-size:13px; margin-top:3px">
                <span>ET: <b style="color:#10b981">${monthData.tarifaET?.toFixed(1) ?? 0}%</b></span>
                &nbsp;|&nbsp;
                <span>MT: <b style="color:#facc15">${monthData.tarifaMT?.toFixed(1) ?? 0}%</b></span>
                &nbsp;|&nbsp;
                <span>VT: <b style="color:#3b82f6">${monthData.tarifaVT?.toFixed(1) ?? 0}%</b></span>
              </div>
            </div>
            ${netoInfo}
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
      min: 0,
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => `${val.toFixed(2)} kWh` },
    },
    legend: { show: true },
  };

  const summaryText = currentMonthData
    ? (() => {
        const realUsage = currentMonthData.totalPrejeta - currentMonthData.totalSolar;
        const netoOddaja = realUsage < 0;

        let dailyValues = currentMonthData.dni.map(([_, d]) => d.poraba);
        let maxValue = Math.max(...dailyValues);
        let minValue = Math.min(...dailyValues);
        let avgValue = dailyValues.length ? dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length : 0;
        let maxDay = currentMonthData.dni.find(([_, d]) => d.poraba === maxValue)?.[0];
        let minDay = currentMonthData.dni.find(([_, d]) => d.poraba === minValue)?.[0];

        let yearComparison: string[] = [];
        if (previousYearSameMonth) {
          // Primerjava porabe
          const laniPoraba = previousYearSameMonth.totalPoraba;
          const letosPoraba = netoOddaja ? 0 : currentMonthData.totalPoraba;
          const razlikaPoraba = letosPoraba - laniPoraba;
          if (!netoOddaja) {
            if (razlikaPoraba < 0)
              yearComparison.push(
                `<span class="text-green-700 dark:text-green-400 font-semibold">Letos ste porabili <b>${Math.abs(razlikaPoraba).toFixed(2)} kWh manj</b> kot lani v istem obdobju.</span>`
              );
            else if (razlikaPoraba > 0)
              yearComparison.push(
                `<span class="text-red-600 dark:text-red-400 font-semibold">Letos ste porabili <b>${Math.abs(razlikaPoraba).toFixed(2)} kWh več</b> kot lani v istem obdobju.</span>`
              );
            else yearComparison.push(`Poraba je bila enaka kot lani.`);
          }
          // Primerjava prejetja
          const laniPrejeta = previousYearSameMonth.totalPrejeta;
          const letosPrejeta = currentMonthData.totalPrejeta;
          const razlikaPrejeta = letosPrejeta - laniPrejeta;
          if (razlikaPrejeta < 0)
            yearComparison.push(
              `<span class="text-green-600 dark:text-green-400 font-semibold">Letos ste prejeli <b>${Math.abs(razlikaPrejeta).toFixed(2)} kWh manj</b> iz omrežja kot lani.</span>`
            );
          else if (razlikaPrejeta > 0)
            yearComparison.push(
              `<span class="text-red-700 dark:text-red-400 font-semibold">Letos ste prejeli <b>${Math.abs(razlikaPrejeta).toFixed(2)} kWh več</b> iz omrežja kot lani.</span>`
            );
          else yearComparison.push(`Prejeta energija iz omrežja je bila enaka kot lani.`);
          // Primerjava oddaje
          const laniSolar = previousYearSameMonth.totalSolar;
          const letosSolar = currentMonthData.totalSolar;
          const razlikaSolar = letosSolar - laniSolar;
          if (razlikaSolar < 0)
            yearComparison.push(
              `<span class="text-red-600 dark:text-red-400 font-semibold">Letos ste oddali <b>${Math.abs(razlikaSolar).toFixed(2)} kWh manj</b> v omrežje kot lani.</span>`
            );
          else if (razlikaSolar > 0)
            yearComparison.push(
              `<span class="text-green-700 dark:text-green-400 font-semibold">Letos ste oddali <b>${Math.abs(razlikaSolar).toFixed(2)} kWh več</b> v omrežje kot lani.</span>`
            );
          else yearComparison.push(`Oddana energija v omrežje je bila enaka kot lani.`);
          // Primerjava neto rezultata
          const laniNeto = laniPrejeta - laniSolar;
          const letosNeto = letosPrejeta - letosSolar;
          const razlikaNeto = letosNeto - laniNeto;
          if (razlikaNeto < 0)
            yearComparison.push(
              `<span class="text-green-700 dark:text-green-400 font-semibold">Vaš neto izid (prejeto - oddano) je <b>${Math.abs(razlikaNeto).toFixed(2)} kWh boljši</b> kot lani.</span>`
            );
          else if (razlikaNeto > 0)
            yearComparison.push(
              `<span class="text-red-600 dark:text-red-400 font-semibold">Vaš neto izid (prejeto - oddano) je <b>${Math.abs(razlikaNeto).toFixed(2)} kWh slabši</b> kot lani.</span>`
            );
          else yearComparison.push(`Neto izid je bil enak kot lani.`);
        }

        const smartTip = netoOddaja
          ? 'V tem mesecu ste proizvedli več energije, kot ste je porabili. Odličen rezultat!'
          : currentMonthData.totalPoraba > 200
            ? 'Nasvet: preglejte največje porabnike in razmislite o preklopu na naprave z manjšo porabo.'
            : 'Vaša poraba je bila učinkovita. Nadaljujte s takšnim načinom upravljanja.';

        return (
          <Accordion collapseAll className="mt-4 border rounded-lg">
            <Accordion.Panel>
              <Accordion.Title className="text-blue-700 dark:text-blue-400">
                {showSummary ? 'Skrij razlago vaših podatkov' : 'Prikaži razlago vaših podatkov'}
              </Accordion.Title>
              <Accordion.Content className="bg-gray-50 dark:bg-gray-900">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  <p className="mb-2">
                    V mesecu <strong>{formatMonth(selectedMonth!)}</strong>{' '}
                    {netoOddaja ? (
                      <>ste oddali v omrežje več energije, kot ste jo prejeli.</>
                    ) : (
                      <>
                        ste porabili <strong>{currentMonthData.totalPoraba.toFixed(2)} kWh</strong>.
                      </>
                    )}
                  </p>
                  <p className="mb-2">
                    Največ ste {netoOddaja ? 'prejeli iz omrežja' : 'porabili'} v{' '}
                    <strong>{maxDay ? formatDaySl(maxDay) : '-'}</strong> (<strong>{maxValue?.toFixed(2)} kWh</strong>
                    ), najmanj pa v <strong>{minDay ? formatDaySl(minDay) : '-'}</strong> (
                    <strong>{minValue?.toFixed(2)} kWh</strong>).
                  </p>
                  <p className="mb-2">
                    Povprečna dnevna {netoOddaja ? 'prejeta energija' : 'poraba'} znaša{' '}
                    <strong>{avgValue?.toFixed(2)} kWh</strong>.
                  </p>
                  <p className="mb-2">
                    Iz omrežja ste prejeli <strong>{currentMonthData.totalPrejeta.toFixed(2)} kWh</strong>, oddali pa{' '}
                    <strong>{currentMonthData.totalSolar.toFixed(2)} kWh</strong>.
                  </p>
                  {netoOddaja ? (
                    <p className="mb-2 text-green-700 dark:text-green-400 font-semibold">
                      V tem mesecu ste v omrežje oddali več energije, kot ste jo prejeli. Neto oddaja:{' '}
                      <strong>{Math.abs(realUsage).toFixed(2)} kWh</strong>
                    </p>
                  ) : (
                    <p className="mb-2">
                      Vaša neto poraba je znašala <strong>{realUsage.toFixed(2)} kWh</strong>.
                    </p>
                  )}
                  {yearComparison.length > 0 && (
                    <div className="mb-2 flex flex-col gap-1">
                      {yearComparison.map((cmp, i) => (
                        <span key={i} dangerouslySetInnerHTML={{ __html: cmp }} />
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-blue-700 dark:text-blue-400 italic">{smartTip}</p>
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        );
      })()
    : null;

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner aria-label="Nalaganje..." size="xl" />
        </div>
      ) : hasError ? (
        <p className="text-red-600">Napaka pri nalaganju podatkov.</p>
      ) : months.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <svg width={50} height={50} viewBox="0 0 24 24" fill="none" className="mb-4 text-blue-500">
            <path
              d="M3 6a1 1 0 0 1 1-1h1V4a1 1 0 1 1 2 0v1h8V4a1 1 0 1 1 2 0v1h1a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 0v14h14V6H5Zm2 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm5 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM7 18h10v-2H7v2Z"
              fill="currentColor"
            />
          </svg>
          <div className="text-lg font-semibold mb-2">Ni podatkov za prikaz</div>
          <div className="text-gray-600 mb-6 text-center max-w-xs">
            Niste še naložili podatkov o porabi elektrike. Za prikaz analiz in grafov najprej dodajte vsaj en račun ali
            CSV datoteko s podatki.
          </div>
          <Link
            to="/upload-data"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
          >
            Naloži podatke
          </Link>
        </div>
      ) : (
        <>
          {Object.entries(netoOddajaMeseci).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.entries(netoOddajaMeseci).map(([month, oddaja]) => (
                <div
                  key={month}
                  className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  <svg width={18} height={18} className="inline" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11.3 1.046a1 1 0 0 1 1.339.482l6.364 12.728a1 1 0 0 1-.447 1.34A1 1 0 0 1 18 16H2a1 1 0 0 1-.89-1.453l8-16A1 1 0 0 1 10.3 1.046ZM10 5.382 4.618 16h10.764L10 5.382Z" />
                  </svg>
                  <span>
                    {formatMonth(month)}: Neto oddaja <b>{oddaja.toFixed(2)} kWh</b>
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mb-6 flex items-center justify-between gap-4">
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
                    <option key={year} value={year}>
                      {year}
                    </option>
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
                data: barSeriesPoraba,
              },
              {
                name: 'Oddana energija (kWh)',
                data: barSeriesSolar,
              },
              {
                name: 'Prejeta energija (kWh)',
                data: barSeriesPrejeta,
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
