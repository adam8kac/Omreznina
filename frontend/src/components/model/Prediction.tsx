import React, { useState } from 'react';
import { Spinner, Button, Alert } from 'flowbite-react';
import { getAuth } from 'firebase/auth';
import { predictMonthlyOverrun, PredictionResponse } from 'src/index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const dayMap = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];

const Stat: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div className="flex flex-col p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
    <span className="font-medium text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="font-bold text-xl text-gray-800 dark:text-white">{value}</span>
  </div>
);

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

  // Priprava podatkov za graf
  const overrunsByDayData = result
    ? Object.entries(result.overruns_by_day).map(([k, v]) => ({
        name: dayMap[parseInt(k)],
        count: v
      }))
    : [];

  return (
    <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300 text-center">
        Napoved prekoračitev moči (naslednji mesec)
      </h2>
      <div className="text-center">
        <Button
          gradientDuoTone="purpleToBlue"
          className="w-full font-bold mb-3"
          size="lg"
          onClick={handlePredict}
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : 'Napovej za naslednji mesec'}
        </Button>
      </div>
      {hasError && (
        <Alert color="failure" className="mb-4">
          {hasError}
        </Alert>
      )}

      {result && lastPredicted && (
        <>
          <div className="mb-5">
            <Alert color={
              result.stats.probability_overrun > 0.8
                ? "warning"
                : result.stats.probability_overrun > 0.5
                ? "info"
                : "success"
            }>
              {result.stats.probability_overrun > 0.8
                ? <>⚡ <b>Zelo visoka verjetnost prekoračitve!</b> Priporočamo nadzor nad porabo ali spremembo dogovorjene moči.</>
                : result.stats.probability_overrun > 0.5
                ? <>ℹ️ <b>Zmerna verjetnost prekoračitve.</b> Spremljaj predvsem “vrhove” porabe.</>
                : <>✅ <b>Nizka verjetnost prekoračitve.</b> Po trenutnih podatkih ni pričakovati višjih kazni.</>
              }
              <br />
              Povprečna temperatura lani: <b>{result.stats.avg_temp ?? '-'}</b> °C
              {result.stats.forecasted_avg_temp !== null && (
                <> | Napoved za naslednji mesec: <b>{result.stats.forecasted_avg_temp}</b> °C</>
              )}
            </Alert>
          </div>
          <h4 className="font-bold text-xl mb-3 text-indigo-700 text-center">
            Rezultati za {monthsList[parseInt(lastPredicted.month) - 1].label} {lastPredicted.year}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Stat label="Število prekoračitev" value={result.stats.overruns_count} />
            <Stat label="Povp. kazen (EUR)" value={result.stats.avg_penalty} />
            <Stat label="Najvišja kazen (EUR)" value={result.stats.max_penalty} />
            <Stat label="Povp. vrh (kW)" value={result.stats.avg_peak} />
            <Stat label="Max vrh (kW)" value={result.stats.max_peak} />
            <Stat label="Nad 85% dog. moči" value={`${(result.stats.frac_over_85 * 100).toFixed(1)}%`} />
            <Stat label="Verjetnost prekoračitve" value={
              <span>
                <span className="mr-2">{Math.round(result.stats.probability_overrun * 100)}%</span>
                <progress
                  className="align-middle"
                  value={Math.round(result.stats.probability_overrun * 100)}
                  max={100}
                  style={{ width: '70px', verticalAlign: 'middle' }}
                />
              </span>
            } />
          </div>
          <div className="mb-2 text-sm">
            <b>Najpogostejši dan prekoračitve:</b> {result.stats.most_common_overrun_day ?? '-'}
            <br />
            <b>Najpogostejša ura prekoračitve:</b> {result.stats.most_common_overrun_hour ?? '-'}
            <br />
            <b>Najpogostejši dan v mesecu:</b> {result.stats.most_common_overrun_day_in_month ?? '-'}
          </div>
          <h5 className="mt-5 mb-2 font-semibold text-indigo-600">Statistika po blokih:</h5>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm border rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
                  <th className="px-4 py-2 text-center">Blok</th>
                  <th className="px-4 py-2 text-center">Povp. vrh</th>
                  <th className="px-4 py-2 text-center">Max vrh</th>
                  <th className="px-4 py-2 text-center">Povp. kazen</th>
                  <th className="px-4 py-2 text-center">Št. meritev</th>
                </tr>
              </thead>
              <tbody>
                {result.block_stats.map((block) => (
                  <tr key={block.block} className="border-b last:border-0">
                    <td className="px-4 py-2 text-center font-semibold">{block.block}</td>
                    <td className="px-4 py-2 text-center">{block.avg_peak.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">{block.max_peak.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">{block.avg_penalty.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">{block.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.stats.overruns_count > 0 && (
            <div className="my-6">
              <h5 className="mb-2 font-semibold text-indigo-600">Prekoračitve po dnevih v tednu</h5>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={overrunsByDayData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PredictionStats;
