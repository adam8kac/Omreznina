import DashboardGuide from "./DashboardGuide";
import Lottie from 'lottie-react';
import animationLine from 'src/assets/lottie/Animation - 1749034009753.json';

const Dashboard = () => {
  return (
    <div className="space-y-10 p-6">
      <div className="text-center space-y-4 relative" style={{ zIndex: 1 }}>
        <div className="absolute left-1/2 top-[100px] md:top-0 w-[300vw] -translate-x-1/2 pointer-events-none select-none" style={{ height: 300, zIndex: 0, opacity: 0.5 }}>
         <div className="py-10"></div>
          <Lottie 
            animationData={animationLine} 
            loop 
            autoplay 
            style={{ width: '300vw', height: 300, minWidth: '300vw', maxWidth: 'none', margin: 0, transform: 'rotate(-11deg)' }} 
          />
        </div>
        <div className="py-3"></div>
        <h1 className="text-4xl font-bold relative z-10">Dobrodošli na Omrežnina+</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-4 relative z-10">
          Preglejte si spletno stran in odkrijte vse skrivnosti vašega obračunavanja elektrike in omrežnine.
        </p>
      
      </div>
      <div className="py-12"></div>
      <DashboardGuide />
    </div>
  );
};

export default Dashboard;
