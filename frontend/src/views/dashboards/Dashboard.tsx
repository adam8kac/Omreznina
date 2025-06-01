import { useState } from 'react';
import NewCustomers from 'src/components/dashboard/NewCustomers';
import MonthlyConsumptionChart from 'src/components/dashboard/MonthlyConsumptionChart';
import { PowerStats } from 'src/components/dashboard/PowerStats';

const Dashboard = () => {
  const [showNewCustomers, setShowNewCustomers] = useState(true);

  const handleCloseNewCustomers = () => {
    setShowNewCustomers(false);
  };

  return (
    <div className="space-y-10 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Dobrodošli na Omrežnina+</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Preglejte si spletno stran in odkrijte vse skrivnosti vašega obračunavanja elektrike in omrežnine.
        </p>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className={showNewCustomers ? 'lg:col-span-8 col-span-12' : 'col-span-12'}>
          <MonthlyConsumptionChart />
        </div>
        {showNewCustomers && (
          <div className="lg:col-span-4 col-span-12">
            <div className="grid grid-cols-12 h-full items-stretch">
              <div className="col-span-12 mb-6">
                <NewCustomers onClose={handleCloseNewCustomers} />
              </div>
            </div>
          </div>
        )}
        <div className={showNewCustomers ? 'lg:col-span-8 col-span-12' : 'col-span-12'}>
          <PowerStats />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
