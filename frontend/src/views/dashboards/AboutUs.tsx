
const AboutUs = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">O nas – Omrežnina+</h1>
        <p className="text-gray-600 text-lg">
          Preberite si več o naši platformi in odkrijte, kako vam lahko pomaga pri nadzoru nad porabo elektrike.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-2">Kaj je Omrežnina+?</h2>
          <p className="text-gray-700">
            Omrežnina+ je sodobna spletna platforma, ki uporabnikom omogoča popoln vpogled v njihovo porabo električne energije
            in obračunavanje omrežnine. Namenjena je vsem, ki želijo imeti več nadzora nad stroški elektrike in boljše razumevanje porabe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Kaj omogoča?</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Pregled mesečne porabe elektrike in stroškov.</li>
            <li>Simulacijo porabe za izbrane naprave glede na dogovorjeno moč.</li>
            <li>Opozorila ob preseganju mej dogovorjene moči.</li>
            <li>Vnos in upravljanje lastnih podatkov o porabi.</li>
            <li>Vizualizacijo trendov porabe skozi čas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Zakaj uporabljati Omrežnina+?</h2>
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
