import { useState } from "react";
import { Card } from "flowbite-react";
import { motion } from "framer-motion";
import NewCustomers from 'src/components/dashboard/NewCustomers';
import { LucideHome, FileUp, FileText, Calculator, BarChart, PieChart, LucideZap, Heart } from "lucide-react";
import { Link } from "react-router";

const pages = [
  {
    name: "Nadzorna plošča",
    path: "/",
    description: "Hiter pregled celotnega sistema, najnovejši podatki in hitre povezave.",
    icon: <LucideHome size={32} />,
  },
  {
    name: "Simulacija porabe",
    path: "/simulate-power",
    description: "Izberi naprave in preveri, če presegaš dogovorjene moči v posameznih blokih.",
    icon: <Calculator size={32} />,
  },
  {
    name: "Omrežnina",
    path: "/network-fee",
    description: "Grafični prikaz časovnih blokov in tarif, razlaga obračunavanja omrežnine.",
    icon: <BarChart size={32} />,
  },
  {
    name: "Poraba po mesecih",
    path: "/monthly-consumption",
    description: "Vizualizacija porabe in oddane energije po mesecih in dnevih.",
    icon: <PieChart size={32} />,
  },
  {
    name: "Statistika moči",
    path: "/power-stats",
    description: "Pokaže, ali si prekoračil dogovorjene moči in koliko si plačal.",
    icon: <LucideZap size={32} />,
  },
  {
    name: "Naloži podatke",
    path: "/upload-data",
    description: "Naloži 15-minutne meritve, stanja ali račun za boljši pregled.",
    icon: <FileUp size={32} />,
  },
  {
    name: "Razlaga računa",
    path: "/reciept-explanation",
    description: "Podrobna razlaga vsake postavke iz računa za elektriko.",
    icon: <FileText size={32} />,
  },
];

const DashboardGuide = () => {
  const [showNewCustomers, setShowNewCustomers] = useState(true);
  const [showAboutUsCard, setShowAboutUsCard] = useState(false);

  const handleCloseNewCustomers = () => {
    setShowNewCustomers(false);
    setShowAboutUsCard(true);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl">Vodnik po strani</h2>
        <p className="text-gray-600 text-base max-w-2xl">
          Spoznaj vse funkcionalnosti portala Omrežnina+ in hitro najdi tisto, kar potrebuješ.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, index) => (
          <motion.div
            key={page.path}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={page.path}>
              <Card className="hover:shadow-xl transition-all duration-300 h-full">
                <div className="p-6 flex flex-col gap-3 items-start">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">{page.icon}</div>
                  <h2 className="text-xl font-semibold">{page.name}</h2>
                  <p className="text-gray-600">{page.description}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}

        {showNewCustomers && (
          <motion.div
            className="sm:col-span-2 lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pages.length * 0.05 }}
          >
            <div className="h-full w-full">
              <NewCustomers onClose={handleCloseNewCustomers} />
            </div>
          </motion.div>
        )}

        {showAboutUsCard && (
          <motion.div
            className="sm:col-span-2 lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (pages.length + 1) * 0.05 }}
          >
            <Link to="/about-us">
              <Card className="hover:shadow-xl transition-all duration-300 h-full">
                <div className="p-6 flex flex-col gap-3 items-start">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Heart size={32} />
                  </div>
                  <h2 className="text-xl font-semibold">Več o nas</h2>
                  <p className="text-gray-600">
                    Spoznaj našo platformo, kako ti lahko pomaga pri nadzoru porabe elektrike in zakaj smo jo ustvarili.
                  </p>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardGuide;
