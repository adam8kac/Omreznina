import { Icon } from "@iconify/react";

const AboutUs = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-4 mb-2 shadow-md">
          <Icon icon="solar:flash-bolt-circle-bold" className="text-blue-500" height={48} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">O nas – Omrežnina+</h1>
        <p className="text-gray-600 text-lg max-w-2xl text-center">
          Preberite si več o naši platformi in odkrijte, kako vam lahko pomaga pri nadzoru nad porabo elektrike.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <section className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-start space-y-3 border-t-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="ph:info-bold" className="text-blue-500" height={30} />
            <h2 className="text-2xl font-semibold">Kaj je Omrežnina+?</h2>
          </div>
          <p className="text-gray-700">
            Omrežnina+ je sodobna spletna platforma, ki uporabnikom omogoča popoln vpogled v njihovo porabo električne energije
            in obračunavanje omrežnine. Namenjena je vsem, ki želijo imeti več nadzora nad stroški elektrike in boljše razumevanje porabe.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-start space-y-3 border-t-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:check-decagram" className="text-green-500" height={30} />
            <h2 className="text-2xl font-semibold">Kaj omogoča?</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Pregled mesečne porabe elektrike in stroškov.</li>
            <li>Simulacijo porabe za izbrane naprave glede na dogovorjeno moč.</li>
            <li>Vnos in upravljanje lastnih podatkov o porabi.</li>
            <li>Vizualizacijo trendov porabe skozi čas.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-start space-y-3 border-t-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="fluent:star-32-filled" className="text-yellow-500" height={30} />
            <h2 className="text-2xl font-semibold">Zakaj uporabljati Omrežnina+?</h2>
          </div>
          <p className="text-gray-700">
            Z uporabo Omrežnina+ boste imeli boljši nadzor nad svojo porabo, lažje boste razumeli mesečne račune
            in se izognili nepotrebnim stroškom zaradi preseganja omrežnih stopenj. Platforma je enostavna za uporabo,
            prijazna do uporabnika in prilagojena tako gospodinjstvom kot tudi manjšim podjetjem.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
