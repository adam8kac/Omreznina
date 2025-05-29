import NewCustomers from 'src/components/dashboard/NewCustomers';
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
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
