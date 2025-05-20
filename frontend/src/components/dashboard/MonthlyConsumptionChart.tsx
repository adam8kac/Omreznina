import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Spinner, Select } from 'flowbite-react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import { getDocumentData, getUserDocIds } from 'src/index';
import { ApexOptions } from 'apexcharts';
import { MonthRecord } from 'src/utils/fetchUserMonthlyData';

type MonthData = MonthRecord & {
  totalDejanska: number;
  totalPoraba: number;
  totalSolar: number;
};

const formatMonth = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' });
};

const MonthlyConsumptionChart = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
        const ids = await getUserDocIds(uid);
        setMonths(ids);

        const result: Record<string, MonthData> = {};

        for (const id of ids) {
          const docMap = await getDocumentData(uid, id);
          const doc = docMap[id];
          if (!doc || !doc.dni) continue;

          let totalPoraba = 0;
          let totalSolar = 0;

          for (const entry of Object.values(doc.dni)) {
            totalPoraba += entry.poraba ?? 0;
            totalSolar += entry.solar ?? 0;
          }

          result[id] = {
            dni: doc.dni,
            totalDejanska: parseFloat((totalPoraba - totalSolar).toFixed(3)),
            totalPoraba: parseFloat(totalPoraba.toFixed(3)),
            totalSolar: parseFloat(totalSolar.toFixed(3)),
          };
        }

        setMonthlyData(result);
        setSelectedMonth(ids[0] || null);
      } catch (e) {
        console.error(e);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  const getSortedDayKeys = (dniObj: Record<string, any>) =>
    Object.keys(dniObj).sort((a, b) => Number(a) - Number(b));

  const optionsBarChart: ApexOptions = {
    chart: { animations: { speed: 500 }, toolbar: { show: false } },
    colors: ['#10b981', '#f87171', '#3b82f6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: months.map(formatMonth),
      axisBorder: { show: false },
      axisTicks: { show: false },
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
          ? getSortedDayKeys(monthlyData[selectedMonth].dni).map((day) => `${selectedMonth}-${day}`)
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

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
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
              { name: 'Dejanska poraba (kWh)', data: months.map((m) => monthlyData[m]?.totalDejanska ?? 0) },
              { name: 'Oddana solarna (kWh)', data: months.map((m) => monthlyData[m]?.totalSolar ?? 0) },
              { name: 'Prejeta energija (kWh)', data: months.map((m) => monthlyData[m]?.totalPoraba ?? 0) },
            ]}
            type="bar"
            height="315px"
            width="100%"
          />

          {selectedMonth && monthlyData[selectedMonth] && Object.keys(monthlyData[selectedMonth].dni).length > 0 ? (
            <>
              {monthlyData[selectedMonth].totalSolar > 0 && (
                <div className="flex items-center gap-2 text-yellow-500 mt-6 mb-4">
                  <Icon icon="mdi:weather-sunny" height={24} />
                  <span>Sončna elektrarna zaznana</span>
                </div>
              )}
              <h5 className="card-title mb-4">Poraba po dnevih za {formatMonth(selectedMonth)}</h5>
              <Chart
                options={optionsDailyChart}
                series={[
                  {
                    name: 'Poraba (kWh)',
                    data: getSortedDayKeys(monthlyData[selectedMonth].dni).map(
                      (day) => monthlyData[selectedMonth].dni[day]?.poraba ?? 0,
                    ),
                  },
                  {
                    name: 'Solar (kWh)',
                    data: getSortedDayKeys(monthlyData[selectedMonth].dni).map(
                      (day) => monthlyData[selectedMonth].dni[day]?.solar ?? 0,
                    ),
                  },
                ]}
                type="line"
                height="300px"
                width="100%"
              />
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
