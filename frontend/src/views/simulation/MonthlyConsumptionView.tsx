import MonthlyConsumptionChart from "src/components/dashboard/MonthlyConsumptionChart";

const MonthlyChartView = () => {
  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <MonthlyConsumptionChart />
    </div>
  );
};

export default MonthlyChartView;
