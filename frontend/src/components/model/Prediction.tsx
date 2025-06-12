import React, { useState } from 'react';
import { Spinner, Button, Alert, Accordion } from 'flowbite-react';
import { getAuth } from 'firebase/auth';
import { predictMonthlyOverrun, PredictionResponse } from 'src/index';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../../css/theme/accordion.css';

const monthsList = [
  { value: '01', label: 'Januar' },
  { value: '02', label: 'Februar' },
  { value: '03', label: 'Marec' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Maj' },
  { value: '06', label: 'Junij' },
  { value: '07', label: 'Julij' },
  { value: '08', label: 'Avgust' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const getNextMonthYear = () => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 2;
  if (month > 12) {
    month = 1;
    year++;
  }
  return {
    month: String(month).padStart(2, '0'),
    year: String(year)
  };
};

// const dayMap = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];


const StatWithTooltip: React.FC<{ label: string; value: any; tooltip: string }> = ({ label, value, tooltip }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div
      className="relative flex flex-col p-3 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      tabIndex={0}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <div className="flex items-center">
        <span className="font-medium text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className="ml-2 text-gray-400 hover:text-blue-500 transition-colors duration-150" style={{position: 'relative'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 7a1 1 0 1 0 2 0 1 1 0 0 0-2 0Zm2 2.75a1 1 0 1 0-2 0v3.5a1 1 0 1 0 2 0v-3.5Z"/></svg>
          {show && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-fade-in z-30 whitespace-normal">
              {tooltip}
            </div>
          )}
        </span>
      </div>
      <span className="font-bold text-xl text-gray-800 dark:text-white">{value}</span>
    </div>
  );
};

const PredictionStats: React.FC = () => {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [lastPredicted, setLastPredicted] = useState<{ year: string; month: string } | null>(null);

  const handlePredict = async () => {
    setIsLoading(true);
    setHasError(null);
    setResult(null);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Uporabnik ni prijavljen!');
      const uid = user.uid;

      const { year, month } = getNextMonthYear();

      const data = await predictMonthlyOverrun({
        uid,
        year,
        month,
      });

      if (data.error) throw new Error(data.error);

      setResult(data);
      setLastPredicted({ year, month });
    } catch (err: any) {
      setHasError(err.message || 'Napaka.');
    } finally {
      setIsLoading(false);
    }
  };

  // const overrunsByDayData = result
  //   ? Object.entries(result.overruns_by_day).map(([k, v]) => ({
  //       name: dayMap[parseInt(k)],
  //       count: v
  //     }))
  //   : [];

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4"> Napoved prekoračitev moči
      </h1>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
           Poglej ali bo na podlagi pretekle porabe in vremena v naslednjem mesecu prišlo do prekoračitve moči.
        </p>
        </div>
      <div className="text-center">
        {isLoading ? (
          <div className="flex justify-center items-center w-full py-8">
            <Spinner size="xl" />
          </div>
        ) : (!result && !isLoading) && (
          <Button
            gradientDuoTone="purpleToBlue"
            className="w-full font-bold mb-3"
            size="lg"
            onClick={handlePredict}
            disabled={isLoading}
          >
            Napovej za naslednji mesec
          </Button>
        )}
      </div>
      {hasError && (
        <Alert color="failure" className="mb-4">
          {hasError}
        </Alert>
      )}

      {result && lastPredicted && (
        <>
         <div className="w-full mb-5 rounded-lg border p-5 shadow-md transition-colors duration-300"
          style={{
            backgroundColor:
              result.stats.probability_overrun >= 0.8 ? '#ffe6e6' :
              result.stats.probability_overrun >= 0.5 ? '#fff9db' :
              '#e6f4ea',
            borderColor:
              result.stats.probability_overrun >= 0.8 ? '#ff4d4d' :
              result.stats.probability_overrun >= 0.5 ? '#f0c419' :
              '#34a853',
          }}
        >
          <div className="flex items-center space-x-4 mb-3">
            <div className="text-3xl">
              {result.stats.probability_overrun >= 0.8
                ? '🚨'
                : result.stats.probability_overrun >= 0.5
                ? '⚠️'
                : '✅'}
            </div>
            <h3 className={`text-lg font-semibold ${
              result.stats.probability_overrun >= 0.8
                ? 'text-red-700'
                : result.stats.probability_overrun >= 0.5
                ? 'text-yellow-700'
                : 'text-green-700'
            }`}>
              {result.stats.probability_overrun >= 0.8
                ? 'Zelo visoka verjetnost prekoračitve!'
                : result.stats.probability_overrun >= 0.5
                ? 'Zmerna verjetnost prekoračitve.'
                : 'Nizka verjetnost prekoračitve.'}
            </h3>
          </div>
          <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
            {result.stats.probability_overrun >= 0.8 && (
              <>Močno priporočamo ukrepanje – zmanjšaj porabo ali prilagodi dogovorjeno moč.</>
            )}
            {result.stats.probability_overrun >= 0.5 && result.stats.probability_overrun < 0.8 && (
              <>Bodi pozoren na vrhove – spremljaj porabo in odzivaj se sproti.</>
            )}
            {result.stats.probability_overrun < 0.5 && (
              <>Po trenutnih podatkih ni pričakovati preseganja moči.</>
            )}
          </p>

          <div className="text-sm text-gray-700 dark:text-gray-300 border-t pt-3 mt-3 flex flex-wrap gap-4">
            <div>
              <span className="font-medium">Povprečna temperatura lani:</span> {result.stats.avg_temp ?? '-'} °C
            </div>
            {result.stats.forecasted_avg_temp !== null && (
              <div>
                <span className="font-medium">Napoved:</span> {result.stats.forecasted_avg_temp} °C
              </div>
            )}
          </div>
        </div>

        </>
      )}
      {result && lastPredicted && (
        <>
          <h4 className="text-2xl font-bold mb-5 text-center text-gray-800 dark:text-white">
            Rezultati za {monthsList[parseInt(lastPredicted.month) - 1].label} {lastPredicted.year}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <StatWithTooltip label="Število prekoračitev" value={result.stats.overruns_count} tooltip="Kolikrat je bila presežena dogovorjena moč v mesecu." />
            <StatWithTooltip label="Povp. kazen (EUR)" value={result.stats.avg_penalty} tooltip="Povprečna kazen za prekoračitve v EUR v tem mesecu." />
            <StatWithTooltip label="Najvišja kazen (EUR)" value={result.stats.max_penalty} tooltip="Najvišja posamezna kazen za prekoračitev v EUR v tem mesecu." />
            <StatWithTooltip label="Max vrh (kW)" value={result.stats.max_peak} tooltip="Najvišja izmerjena moč v mesecu (kW)." />
            <StatWithTooltip label="Nad 85% dog. moči" value={`${(result.stats.frac_over_85 * 100).toFixed(1)}%`} tooltip="Delež meritev, kjer je bila moč nad 85% dogovorjene moči." />
            <StatWithTooltip label="Verjetnost prekoračitve" value={<span><span className="mr-2">{Math.round(result.stats.probability_overrun * 100)}%</span><progress className="align-middle" value={Math.round(result.stats.probability_overrun * 100)} max={100} style={{ width: '70px', verticalAlign: 'middle' }} /></span>} tooltip="Verjetnost, da bo v naslednjem mesecu prišlo do prekoračitve dogovorjene moči." />
          </div>
          <div className="mb-5 text-sm">
            <b>Najpogostejši dan prekoračitve:</b> {result.stats.most_common_overrun_day ?? '-'}
            <br />
            <b>Najpogostejša ura prekoračitve:</b> {result.stats.most_common_overrun_hour ?? '-'}
            <br />
          </div>
            <h4 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">
            Statistika po blokih
            </h4>
          <div className="hidden sm:block overflow-x-auto rounded-xl shadow-md bg-white dark:bg-darkgray border border-gray-200 mb-4">
            <table className="w-full min-w-[600px] text-xs sm:text-sm">
              <thead className="bg-blue-200 text-blue-800 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-3 py-3 text-left text-center">Blok</th>
                  <th className="px-3 py-3 text-left text-center">Max vrh</th>
                  <th className="px-3 py-3 text-left text-center">Povp. kazen</th>
                  <th className="px-3 py-3 text-left text-center">Št. meritev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.block_stats.map((block) => (
                  <tr key={block.block} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center font-semibold">{block.block}</td>
                    <td className="px-3 py-3 text-center">{block.max_peak.toFixed(2)}</td>
                    <td className="px-3 py-3 text-center">{block.avg_penalty.toFixed(2)}</td>
                    <td className="px-3 py-3 text-center">{block.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden space-y-3 mb-4">
            {result.block_stats.map((block) => (
              <div key={block.block} className="rounded-xl shadow-sm border border-gray-200 bg-white dark:bg-darkgray p-4">
                <div className="font-bold text-indigo-600 mb-1">Blok {block.block}</div>
                <div className="text-sm text-gray-700 dark:text-gray-200"><b>Max vrh:</b> {block.max_peak.toFixed(2)} kW</div>
                <div className="text-sm text-gray-700 dark:text-gray-200"><b>Povp. kazen:</b> {block.avg_penalty.toFixed(2)} €</div>
                <div className="text-sm text-gray-700 dark:text-gray-200"><b>Št. meritev:</b> {block.count}</div>
              </div>
            ))}
          </div>
          {/* {result.stats.overruns_count > 0 && (
            <div className="my-6">
              <h5 className="mb-2 font-semibold text-indigo-600">Prekoračitve po dnevih v tednu</h5>
              <div className="w-full">
              <div style={{height: 300 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={overrunsByDayData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </div>
            </div>
          )} */}

    </>
      )}
      <div className="mt-8 bg-white p-4 rounded-xl">
        <Accordion collapseAll>
          <Accordion.Panel>
            <Accordion.Title>Zakaj je napoved pomembna?</Accordion.Title>
            <Accordion.Content>
              <div className="accordion-content-transition">
                <p className="text-sm text-gray-700">
                  <b>Napoved prekoračitev moči</b> vam omogoča, da vnaprej veste, kdaj obstaja večja verjetnost, da boste presegli dogovorjeno moč.
                </p>
                <ul className="list-disc pl-5 mb-2 mt-4 text-sm text-gray-700">
                  <li>Pomaga pri <b>načrtovanju porabe</b> in izogibanju visokim kaznim.</li>
                  <li>Omogoča <b>pravočasno ukrepanje</b> (npr. zmanjšanje porabe ali prilagoditev dogovorjene moči).</li>
                  <li>Prispeva k <b>nižjim stroškom</b> in boljši optimizaciji vašega elektro računa.</li>
                  <li>Napoved temelji na <b>vaših zgodovinskih podatkih</b> in vremenskih vplivih.</li>
                </ul>
                <p className="mb-2 text-sm text-gray-700">
                  Če veste, kdaj je verjetnost prekoračitve visoka, lahko prilagodite svoje navade in se izognete nepotrebnim stroškom.
                </p>
                <p className="text-blue-700 dark:text-blue-400 italic mt-3 text-sm">
                  <b>Napoved je informativna in ne zagotavlja 100% natančnosti, vendar je odlično orodje za boljše upravljanje vaše porabe.</b>
                </p>
              </div>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
  );
};

export default PredictionStats;
