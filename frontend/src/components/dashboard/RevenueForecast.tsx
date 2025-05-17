import { Spinner, Select } from 'flowbite-react';
import Chart from 'react-apexcharts';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { fetchUserMonthlyData, MonthRecord } from 'src/utils/fetchUserMonthlyData';
import { ApexOptions } from 'apexcharts';

const formatMonth = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' });
};

const getSortedDayKeys = (dniObj: Record<string, any>) =>
  Object.keys(dniObj)
    .map((k) => k)
    .sort((a, b) => Number(a) - Number(b));

const RevenueForecast = () => {
  const [data, setData] = useState<Record<string, MonthRecord>>({});
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const months = Object.keys(data);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const result = await fetchUserMonthlyData();
        setData(result);
        setSelectedMonth(Object.keys(result)[0] || null);
      } catch (error) {
        console.error('Napaka pri branju podatkov:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const optionsBarChart: ApexOptions = {
    chart: { animations: { speed: 500 }, toolbar: { show: false } },
    colors: ['#6366f1', '#f87171'],
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
    tooltip: { theme: 'dark' },
    legend: { show: true },
  };

  const optionsDailyChart: ApexOptions = {
    chart: { animations: { speed: 500 }, toolbar: { show: false } },
    colors: ['#60a5fa', '#facc15'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories:
        selectedMonth && data[selectedMonth]
          ? getSortedDayKeys(data[selectedMonth].dni).map((day) => `${selectedMonth}-${day}`)
          : [],
      labels: { rotate: -45 },
    },
    yaxis: {
      labels: { formatter: (val) => `${val} kWh` },
    },
    tooltip: { theme: 'dark' },
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
              { name: 'Poraba (kWh)', data: months.map((m) => data[m].totalPoraba) },
              { name: 'Solar (kWh)', data: months.map((m) => data[m].totalSolar) },
            ]}
            type="bar"
            height="315px"
            width="100%"
          />

          {selectedMonth &&
          data[selectedMonth] &&
          Object.keys(data[selectedMonth].dni).length > 0 ? (
            <>
              {data[selectedMonth].totalSolar > 0 && (
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
                    data:
                      selectedMonth && data[selectedMonth]
                        ? getSortedDayKeys(data[selectedMonth].dni).map(
                            (day) => data[selectedMonth].dni[day]?.poraba ?? 0,
                          )
                        : [],
                  },
                  {
                    name: 'Solar (kWh)',
                    data:
                      selectedMonth && data[selectedMonth]
                        ? getSortedDayKeys(data[selectedMonth].dni).map(
                            (day) => data[selectedMonth].dni[day]?.solar ?? 0,
                          )
                        : [],
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

export { RevenueForecast };
