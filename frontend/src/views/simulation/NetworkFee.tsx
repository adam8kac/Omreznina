import { FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const blockColors: Record<number, string> = {
  1: 'bg-[#003A63]',
  2: 'bg-[#2F6D9F]',
  3: 'bg-[#80A6C3]',
  4: 'bg-[#A7C4CF]',
  5: 'bg-[#0FA9A0]'
};

const HourBlock = ({ hour, block }: { hour: number; block: number }) => (
  <div
    className={`w-6 h-6 rounded-full text-[10px] text-white flex items-center justify-center ${blockColors[block]}`}
    title={`Ura ${hour}: Blok ${block}`}
  >
    {hour}
  </div>
);

const HourRing = ({ title, blocks }: { title: string; blocks: number[] }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center space-y-2"
  >
    <p className="font-semibold text-sm text-center">{title}</p>
    <div className="grid grid-cols-12 gap-1">
      {blocks.map((block, i) => (
        <HourBlock key={i} hour={i} block={block} />
      ))}
    </div>
  </motion.div>
);

const NetworkFee = () => {
  const visjaDelovni = [3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 3, 3];
  const visjaProst =   [4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 3, 3, 3, 4, 4];
  const nizjaDelovni = [4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 3, 3, 4, 4];
  const nizjaProst =   [5, 5, 5, 5, 5, 5, 4, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 4, 4, 4, 5, 5];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Obračunavanje omrežnine</h1>
      <p className="text-gray-700">
        Omrežnina je strošek, ki ga plačujemo za uporabo elektroenergetskega omrežja. Obračunavanje poteka po časovnih blokih (1–5), ki so razdeljeni glede na sezono in dan v tednu. Blok 1 pomeni
        najvišjo obremenjenost omrežja in posledično višjo tarifo, medtem ko blok 5 pomeni najnižjo tarifo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <HourRing title="Višja sezona: Delovni dan (nov–feb)" blocks={visjaDelovni} />
        <HourRing title="Višja sezona: Dela prost dan (nov–feb)" blocks={visjaProst} />
        <HourRing title="Nižja sezona: Delovni dan (mar–okt)" blocks={nizjaDelovni} />
        <HourRing title="Nižja sezona: Dela prost dan (mar–okt)" blocks={nizjaProst} />
      </div>

      <div className="mt-6">
        <p className="font-medium text-gray-800 flex items-center gap-2">
          <FaInfoCircle /> Časovni bloki (1 = najvišja tarifa, 5 = najnižja tarifa):
        </p>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map(b => (
            <div key={b} className={`w-10 h-5 rounded ${blockColors[b as keyof typeof blockColors]}`} title={`Blok ${b}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkFee;