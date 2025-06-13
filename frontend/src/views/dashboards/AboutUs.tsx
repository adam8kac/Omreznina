import { Icon } from "@iconify/react";

const AboutUs = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div
          className="bg-gradient-to-br from-violet-200 to-indigo-300 rounded-full p-4 mb-2 shadow-lg animate-pulse cursor-pointer relative"
          onClick={() => window.location.href = '/easteregg'}
          title="Easter Egg"
        >
          <Icon icon="solar:flash-bolt-circle-bold" className="text-indigo-600 relative z-10" height={48} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-black">O nas – Omrežnina+</h1>
        <p className="text-black/70 text-lg max-w-2xl">
          Spoznajte našo platformo in odkrijte, kako vam lahko pomaga pri spremljanju porabe in nadzoru nad stroški elektrike.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-start space-y-4 border-t-4 border-violet-500 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="ph:info-bold" className="text-violet-600" height={30} />
            <h2 className="text-2xl font-semibold text-black">Kaj je Omrežnina+?</h2>
          </div>
          <p className="text-black/70">
            Omrežnina+ je platforma, ki omogoča lažje spremljanje porabe elektrike in izračuna omrežnine. Pomaga vam razumeti stroške ter upravljati svojo porabo učinkovito in pregledno.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-start space-y-4 border-t-4 border-indigo-500 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:check-decagram" className="text-indigo-600" height={30} />
            <h2 className="text-2xl font-semibold text-black">Kaj omogoča?</h2>
          </div>
          <ul className="list-disc list-inside text-black/70 space-y-1">
            <li>Pregled porabe elektrike ter stroškov.</li>
            <li>Simulacijo porabe naprav glede na dogovorjeno moč.</li>
            <li>Uvoz podatkov z mojelektro.si ali ročni vnos.</li>
            <li>Napoved prekoračitev.</li>
            <li>Vizualno spremljanje trendov, optimizacij in preteklih prekoračitev.</li>
            <li>Pogovor s pametnim chatbotom o elektriki in omrežninah.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-start space-y-4 border-t-4 border-purple-500 transition-transform duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="fluent:star-32-filled" className="text-purple-600" height={30} />
            <h2 className="text-2xl font-semibold text-black">Zakaj uporabljati Omrežnina+?</h2>
          </div>
          <p className="text-black/70">
            Z aplikacijo Omrežnina+ boste lažje razumeli porabo, se izognili prekoračitvam moči in prihranili pri stroških. Platforma je intuitivna, vizualno privlačna in primerna tako za gospodinjstva kot tudi podjetja.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
