import { FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Accordion } from 'flowbite-react';
import { Link } from 'react-router';
import { FaSun, FaMoon } from 'react-icons/fa';


const blockColors: Record<number, string> = {
  1: 'bg-[#fa144d]',
  2: 'bg-[#faa63e]',
  3: 'bg-[#FFD900]',
  4: 'bg-[#2FBE8F]',
  5: 'bg-[#B8D900]'  
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
    className="space-y-2 w-full items-center flex flex-col"
  >
    <p className="font-semibold text-sm text-center">{title}</p>

    <div className="flex gap-[4px] justify-center w-full">
      {blocks.map((_, i) => (
        <div key={i} className="w-6 h-5 flex items-end justify-center">
          {i === 0 && <FaSun className="text-yellow-400 text-sm mb-1" />}
          {i === 23 && <FaMoon className="text-blue-500 text-sm mb-1" />}
        </div>
      ))}
    </div>

    <div className="flex gap-[4px] justify-center w-full">
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
    <div className="mt-8 bg-white p-4 rounded-xl">
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Obračunavanje omrežnine</h1>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto text-center">
        Omrežnina je strošek, ki ga plačujemo za uporabo elektroenergetskega omrežja. Obračunavanje poteka po časovnih blokih (1–5), ki so razdeljeni glede na sezono in dan v tednu. Blok 1 pomeni
        najvišjo obremenjenost omrežja in posledično višjo tarifo, medtem ko blok 5 pomeni najnižjo tarifo.
      </p>

      <p className="text-sm text-left text-gray-400 text-center">
        Prikaz časovnih blokov glede na uro v dnevu (00:00–23:00) :
      </p>

      <div className="flex flex-col gap-8">
        <HourRing title="Višja sezona: Delovni dan (nov–feb)" blocks={visjaDelovni} />
        <HourRing title="Višja sezona: Dela prost dan (nov–feb)" blocks={visjaProst} />
        <HourRing title="Nižja sezona: Delovni dan (mar–okt)" blocks={nizjaDelovni} />
        <HourRing title="Nižja sezona: Dela prost dan (mar–okt)" blocks={nizjaProst} />
      </div>
      <div className="mt-6">
        <p className="font-medium text-gray-800 flex items-center gap-2">
          <FaInfoCircle /> Časovni bloki (1 = najvišja tarifa, 5 = najnižja tarifa):
        </p>
      <div className="flex flex-wrap gap-4 mt-2 items-start">
        {[1, 2, 3, 4, 5].map(b => (
          <div key={b} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded ${blockColors[b as keyof typeof blockColors]}`}
              title={`Blok ${b}`}
            />
            <p className="text-sm text-gray-700">Časovni blok {b}</p>
          </div>
        ))}
      </div>
      <br />
        <Accordion collapseAll>
          <Accordion.Panel>
            <Accordion.Title>Priporočilo za nižje stroške</Accordion.Title>
            <Accordion.Content>
              <p className="text-sm text-gray-700">
                Vaše električne naprave naj delujejo v času manjše električne tarife (med tednom od 22. do 6. ure ter ob vikendih in praznikih cel dan). 
                Z uporabo naprav v manjši tarifi boste znižali mesečne stroške in pripomogli k zmanjšanju obremenitev električnega omrežja v času višjih dnevnih tarifnih postavk. 
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Za simulacijo porabe si lahko ogledate stran {' '}  
              <Link to="/simulate-power" className="text-blue-600 underline">
                simulacija porabe
              </Link>.
              </p>
            </Accordion.Content>
          </Accordion.Panel>
	  	</Accordion>

    	  </div>
      </div>
    </div>
  );
};

export default NetworkFee;