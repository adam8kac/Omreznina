import _React, { useState } from "react";
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

interface DayRecord {
  poraba: number;
  solar: number;
}

interface MonthRecord {
  dni: Record<string, DayRecord>;
  totalPoraba: number;
  totalSolar: number;
}

const mockData: Record<string, MonthRecord> = {
  "2025-04": {
    dni: {
      "01": { poraba: 2.149, solar: 0 },
      "02": { poraba: 2.245, solar: 0 },
      "03": { poraba: 2.228, solar: 0 },
      "04": { poraba: 2.181, solar: 0 },
      "05": { poraba: 8.657, solar: 0 },
      "06": { poraba: 8.984, solar: 0 },
      "07": { poraba: 2.382, solar: 0 },
      "08": { poraba: 2.491, solar: 0 },
      "09": { poraba: 2.206, solar: 0 },
      "10": { poraba: 2.21, solar: 0 },
      "11": { poraba: 2.153, solar: 0 },
      "12": { poraba: 6.567, solar: 0 },
      "13": { poraba: 6.872, solar: 0 },
      "14": { poraba: 1.194, solar: 0 },
      "15": { poraba: 1.377, solar: 0 },
      "16": { poraba: 1.536, solar: 0 },
      "17": { poraba: 1.394, solar: 0 },
      "18": { poraba: 1.746, solar: 0 },
      "19": { poraba: 5.883, solar: 0 },
      "20": { poraba: 5.175, solar: 0 },
      "21": { poraba: 4.413, solar: 0 },
      "22": { poraba: 1.3, solar: 0 },
      "23": { poraba: 1.33, solar: 0 },
      "24": { poraba: 1.342, solar: 0 },
      "25": { poraba: 1.773, solar: 0 },
      "26": { poraba: 8.764, solar: 0 },
      "27": { poraba: 7.078, solar: 0 },
      "28": { poraba: 1.601, solar: 0 },
      "29": { poraba: 1.499, solar: 0 },
      "30": { poraba: 2.015, solar: 0 }
    },
    totalPoraba: 103.12,
    totalSolar: 0
  }
};

const RevenueForecast = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const months = Object.keys(mockData);

  const monthlySeries = [
    {
      name: "Poraba (kWh)",
      data: months.map((month) => mockData[month].totalPoraba),
    },
    {
      name: "Solar (kWh)",
      data: months.map((month) => mockData[month].totalSolar),
    },
  ];

  const dailySeries = selectedMonth
    ? [
        {
          name: "Poraba (kWh)",
          data: Object.values(mockData[selectedMonth].dni).map((d) => d.poraba),
        },
        {
          name: "Solar (kWh)",
          data: Object.values(mockData[selectedMonth].dni).map((d) => d.solar),
        },
      ]
    : [];

  const dailyCategories = selectedMonth
    ? Object.keys(mockData[selectedMonth].dni).map((day) => `${selectedMonth}-${day}`)
    : [];

  const optionsBarChart: ApexOptions = {
    chart: {
      animations: { speed: 500 },
      toolbar: { show: false },
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const monthKey = months[config.dataPointIndex];
          setSelectedMonth(monthKey);
        },
      },
    },
    colors: ["#6366f1", "#f87171"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: months.map((m) => m),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: (val) => `${val} kWh` },
    },
    tooltip: { theme: "dark" },
    legend: { show: true },
  };

  const optionsDailyChart: ApexOptions = {
    chart: { animations: { speed: 500 }, toolbar: { show: false } },
    colors: ["#60a5fa", "#facc15"],
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: dailyCategories,
      labels: { rotate: -45 },
    },
    yaxis: {
      labels: { formatter: (val) => `${val} kWh` },
    },
    tooltip: { theme: "dark" },
    legend: { show: true },
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title mb-4">Prikaz mesečne porabe</h5>

      <Chart
        options={optionsBarChart}
        series={monthlySeries}
        type="bar"
        height="315px"
        width="100%"
      />

      {selectedMonth && (
        <div className="mt-10">
          <h5 className="card-title mb-4">Poraba po dnevih za {selectedMonth}</h5>
          <Chart
            options={optionsDailyChart}
            series={dailySeries}
            type="line"
            height="300px"
            width="100%"
          />
        </div>
      )}
    </div>
  );
};

export { RevenueForecast };