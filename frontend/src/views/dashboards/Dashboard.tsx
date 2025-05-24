import BlogCards from 'src/components/dashboard/BlogCards';
import NewCustomers from 'src/components/dashboard/NewCustomers';
import TotalIncome from 'src/components/dashboard/TotalIncome';
import MonthlyConsumptionChart from 'src/components/dashboard/MonthlyConsumptionChart';

const Dashboard = () => {
	return (
		<div className="grid grid-cols-12 gap-30">
			<div className="lg:col-span-8 col-span-12">
				<MonthlyConsumptionChart />
			</div>
			<div className="lg:col-span-4 col-span-12">
				<div className="grid grid-cols-12 h-full items-stretch">
					<div className="col-span-12 mb-30">
						<NewCustomers />
					</div>
					<div className="col-span-12">
						<TotalIncome />
					</div>
				</div>
			</div>
			<div className="col-span-12">
				<BlogCards />
			</div>
			<div className="flex justify-center align-middle gap-2 flex-wrap col-span-12 text-center">
				<p className="text-base">
					Ekipa GTA
				</p>
			</div>
		</div>
	);
};

export default Dashboard;
