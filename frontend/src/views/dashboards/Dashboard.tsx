import DashboardGuide from "./DashboardGuide";

const Dashboard = () => {
  return (
    <div className="space-y-10 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Dobrodošli na Omrežnina+</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Preglejte si spletno stran in odkrijte vse skrivnosti vašega obračunavanja elektrike in omrežnine.
        </p>
        <div className="mt-6 flex justify-center">
          <svg
            width="100%"
            height="60"
            viewBox="0 0 800 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="max-w-5xl"
          >
            <path
              d="M0 30 
                 C50 0, 100 60, 150 30 
                 C200 0, 250 60, 300 30 
                 C350 0, 400 60, 450 30 
                 C500 0, 550 60, 600 30 
                 C650 0, 700 60, 750 30 
                 C775 15, 800 30, 825 30"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="1000"
                to="0"
                dur="6s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dasharray"
                from="0, 1000"
                to="1000, 0"
                dur="6s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
      </div>
      <DashboardGuide />
    </div>
  );
};

export default Dashboard;
