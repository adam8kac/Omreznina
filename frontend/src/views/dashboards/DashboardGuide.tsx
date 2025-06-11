import { Card } from "flowbite-react";
import { motion } from "framer-motion";
import { LucideHome, FileUp, FileText, Calculator, BarChart, PieChart, LucideZap, Heart, FileKey2Icon } from "lucide-react";
import { Link } from "react-router";
import ChatbotPopup from '../../components/chatbot/ChatbotComponent';

const DashboardGuide = () => {

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
		{
			name: "Napoved",
			path: "/prediction",
			description: "Napoved prekoračitve moči za naslednji mesec na podlagi podatkov in vremena.",
			icon: <span className="text-purple-550"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M17.75 2.75a.75.75 0 0 1 .75.75v1.25h1.25a.75.75 0 0 1 0 1.5H18.5v1.25a.75.75 0 0 1-1.5 0V6.25H15.75a.75.75 0 0 1 0-1.5H17V3.5a.75.75 0 0 1 .75-.75Zm-11 7a.75.75 0 0 1 .75.75v.75h.75a.75.75 0 0 1 0 1.5h-.75v.75a.75.75 0 0 1-1.5 0v-.75h-.75a.75.75 0 0 1 0-1.5h.75v-.75a.75.75 0 0 1 .75-.75Zm13.53 2.22a.75.75 0 0 1 1.06 0l.53.53.53-.53a.75.75 0 1 1 1.06 1.06l-.53.53.53.53a.75.75 0 1 1-1.06 1.06l-.53-.53-.53.53a.75.75 0 1 1-1.06-1.06l.53-.53-.53-.53a.75.75 0 0 1 0-1.06ZM12.53 5.47a.75.75 0 0 1 0 1.06l-8 8a.75.75 0 0 1-1.06-1.06l8-8a.75.75 0 0 1 1.06 0Zm-6.22 9.97 2.25 2.25a2.25 2.25 0 0 0 3.18 0l5.25-5.25a2.25 2.25 0 0 0 0-3.18l-2.25-2.25-8.43 8.43Zm3.9 3.19-2.25-2.25-1.22 1.22a.75.75 0 0 0 0 1.06l1.19 1.19a.75.75 0 0 0 1.06 0l1.22-1.22Zm7.07-7.07-5.25 5.25 1.13 1.13 5.25-5.25-1.13-1.13Z"/></svg></span>,
		},
		{
			name: "Chatbot",
			path: "/",
			description: "Pogovori se z AI pomočnikom za pomoč, razlago ali vprašanja o portalu.",
			icon: (
				<span className="text-purple-550">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.03 2 11c0 2.39 1.05 4.56 2.83 6.23-.13.48-.51 1.7-.7 2.32-.13.41.28.78.68.64.66-.23 1.98-.7 2.6-.92C9.13 19.76 10.53 20 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9Zm-3 8.5c.83 0 1.5.67 1.5 1.5S9.83 13.5 9 13.5 7.5 12.83 7.5 12s.67-1.5 1.5-1.5Zm6 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5Zm-6.65 4.15c.2-.2.51-.2.71 0C8.68 15.32 10.27 16 12 16s3.32-.68 3.94-1.35a.5.5 0 1 1 .71.7C15.82 16.18 14.02 17 12 17s-3.82-.82-4.65-1.65a.5.5 0 0 1 0-.7Z"/></svg>
				</span>
			),
		},
		{
			name: "Pregled datotek",
			path: "/delete-files",
			description: "Pregled vseh naloženih datotek in možnost njihovega izbrisa.",
			icon: <FileKey2Icon size={32} />,
		},
		
	];

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
				<ChatbotPopup />
			</div>
		</div>
	);
};

export default DashboardGuide;
