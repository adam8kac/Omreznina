import { FaInfoCircle } from 'react-icons/fa';

const blockColors: Record<number, string> = {
  1: '#fa144d',
  2: '#faa63e',
  3: '#FFD900',
  4: '#2FBE8F',
};

const formatKW = (value: any) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.0 kW' : `${num.toFixed(1)} kW`;
};
const formatEUR = (value: any) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00 €' : `${num.toFixed(2)} €`;
};

// Skupna prekoračitev (vsota prekoračenih vrednosti)
const calculateExcessForPower = (
  dataArr: any[] | undefined,
  agreedPower: number | string | undefined
) => {
  const power = parseFloat(String(agreedPower ?? 0));
  if (!Array.isArray(dataArr) || isNaN(power)) return 0;
  return dataArr.reduce((sum, el) => {
    const maxPower =
      Number(el.maxPowerRecieved ?? el.maxPowerReceived ?? el.maxPower ?? el.max_power ?? el['max power']) || 0;
    return sum + Math.max(0, maxPower - power);
  }, 0);
};

// Največja izmed vseh maxPowerRecieved v bloku
const calculateMaxPowerRecieved = (dataArr: any[] | undefined) => {
  if (!Array.isArray(dataArr) || !dataArr.length) return 0;
  return Math.max(
    ...dataArr.map(
      el =>
        Number(el.maxPowerRecieved ?? el.maxPowerReceived ?? el.maxPower ?? el.max_power ?? el['max power']) || 0
    )
  );
};

const PowerBlockAnalysisTable = ({
  prekoracitveData,
  optimumData,
}: {
  prekoracitveData: Record<string, any>;
  optimumData: Record<string, any>;
}) => {
  const blocks = [1, 2, 3, 4].map((blockNumber) => {
    const current = prekoracitveData?.[blockNumber] ?? {};
    const optimal = optimumData?.[blockNumber] ?? {};

    const agreedPowerRaw = current.data?.[0]?.agreedPower;
    const optimalAgreedPowerRaw = optimal.data?.[0]?.agreedPower;

    const maxPowerRecieved = calculateMaxPowerRecieved(current.data);
    const maxPowerRecievedOpt = calculateMaxPowerRecieved(optimal.data);

    const excess = calculateExcessForPower(current.data, agreedPowerRaw);
    const recommendedExcess = calculateExcessForPower(current.data, optimalAgreedPowerRaw);

    const paid = Number(current['total price'] ?? 0);
    const paidOpt = Number(optimal['total price'] ?? 0);
    const saving = Math.max(paid - paidOpt, 0);

    const allZero =
      (!agreedPowerRaw || Number(agreedPowerRaw) === 0) &&
      excess === 0 &&
      paid === 0 &&
      (!optimalAgreedPowerRaw || Number(optimalAgreedPowerRaw) === 0) &&
      recommendedExcess === 0 &&
      paidOpt === 0 &&
      saving === 0;

    if (allZero) return null;

    return {
      blockNumber,
      agreedPowerRaw,
      maxPowerRecieved,
      excess,
      paid,
      optimalAgreedPowerRaw,
      maxPowerRecievedOpt,
      recommendedExcess,
      paidOpt,
      saving,
    };
  }).filter(Boolean);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-3 text-center">Primerjava po blokih</h2>
      {/* Desktop */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow hidden md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-200 text-blue-800 uppercase text-xs font-semibold">
              <th className="p-2 font-semibold text-center"></th>
              <th className="p-2 font-semibold text-center">Blok</th>
              <th className="p-2 font-semibold text-center">Trenutna dog. moč</th>
              <th className="p-2 font-semibold text-center">Max. moč</th>
              <th className="p-2 font-semibold text-center">Prekoračitev</th>
              <th className="p-2 font-semibold text-center">Plačano</th>
              <th className="p-2 font-semibold text-center">Priporočena dog. moč</th>
              <th className="p-2 font-semibold text-center">Max. moč (priporočilo)</th>
              <th className="p-2 font-semibold text-center">Prekoračitev (priporočilo)</th>
              <th className="p-2 font-semibold text-center">Cena po priporočilu</th>
              <th className="p-2 font-semibold text-center">Prihranek</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block: any) => (
              <tr key={block.blockNumber} className="text-center">
                <td className="pl-4 pr-0 py-4 align-middle">
                  <span
                    style={{
                      background: blockColors[block.blockNumber],
                      display: 'inline-block',
                      borderRadius: '9999px',
                      width: 18,
                      height: 18,
                      marginRight: 0,
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 1px #e5e7eb'
                    }}
                  />
                </td>
                <td className="px-2 py-4 font-bold text-gray-800 text-left">{`Blok ${block.blockNumber}`}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatKW(block.agreedPowerRaw)}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatKW(block.maxPowerRecieved)}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatKW(block.excess)}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatEUR(block.paid)}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatKW(block.optimalAgreedPowerRaw)}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatKW(block.maxPowerRecievedOpt)}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatKW(block.recommendedExcess)}</td>
                <td className="px-2 py-4 font-medium text-gray-800">{formatEUR(block.paidOpt)}</td>
                <td className="px-2 py-4 font-bold text-gray-900">{formatEUR(block.saving)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-4">
        {blocks.map((block: any) => (
          <div
            key={block.blockNumber}
            className="bg-white border border-gray-200 rounded-2xl shadow p-4 flex gap-3"
          >
            <span
              style={{
                background: blockColors[block.blockNumber],
                display: 'inline-block',
                borderRadius: '9999px',
                width: 22,
                height: 22,
                minWidth: 22,
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px #e5e7eb',
                marginTop: 4,
              }}
            />
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900 mb-1">{`Blok ${block.blockNumber}`}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="font-medium text-gray-500">Trenutna dog. moč</span>
                <span>{formatKW(block.agreedPowerRaw)}</span>
                <span className="font-medium text-gray-500">Max. moč</span>
                <span>{formatKW(block.maxPowerRecieved)}</span>
                <span className="font-medium text-gray-500">Prekoračitev</span>
                <span>{formatKW(block.excess)}</span>
                <span className="font-medium text-gray-500">Plačano</span>
                <span>{formatEUR(block.paid)}</span>
                <span className="font-medium text-gray-500">Priporočena dog. moč</span>
                <span>{formatKW(block.optimalAgreedPowerRaw)}</span>
                <span className="font-medium text-gray-500">Max. moč (priporočilo)</span>
                <span>{formatKW(block.maxPowerRecievedOpt)}</span>
                <span className="font-medium text-gray-500">Prekoračitev (priporočilo)</span>
                <span>{formatKW(block.recommendedExcess)}</span>
                <span className="font-medium text-gray-500">Cena po priporočilu</span>
                <span>{formatEUR(block.paidOpt)}</span>
                <span className="font-medium text-gray-500">Prihranek</span>
                <span className="font-bold">{formatEUR(block.saving)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-800 text-sm flex items-start gap-3">
        <FaInfoCircle className="mt-1 text-blue-400" />
        <span>
          <b>Blok 5 se ne prikazuje</b>, ker je cena za ta časovni blok praktično vedno 0&nbsp;€. <br />
          Obračun v bloku 5 (najnižja tarifa) se izvede samo v redkih primerih in ne vpliva na vašo ceno pri dogovorjeni moči ali prekoračitvah.
        </span>
      </div>
    </div>
  );
};

export default PowerBlockAnalysisTable;
