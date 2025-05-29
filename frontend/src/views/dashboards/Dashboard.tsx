import NewCustomers from 'src/components/dashboard/NewCustomers';
import MonthlyConsumptionChart from 'src/components/dashboard/MonthlyConsumptionChart';

const Dashboard = () => {
	return (
		<div className="space-y-10 p-6">
			<div className="text-center space-y-2">
				<h1 className="text-4xl font-bold">Dobrodošli na Omrežnina+</h1>
				<p className="text-gray-600 text-lg max-w-2xl mx-auto">
					Preglejte si spletno stran in odkrijte vse skrivnosti vašega obračunavanja elektrike in omrežnine.
				</p>
			</div>
 			<div className="grid grid-cols-12 gap-6">
				<div className="lg:col-span-8 col-span-12">
					<MonthlyConsumptionChart />
				</div>
				<div className="lg:col-span-4 col-span-12">
					<div className="grid grid-cols-12 h-full items-stretch">
						<div className="col-span-12 mb-6">
							<NewCustomers />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
