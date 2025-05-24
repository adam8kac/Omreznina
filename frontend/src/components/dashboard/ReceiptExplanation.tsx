// import { getManualInvoice, ManualInvoice } from "src/index";  // Odkomentiraj ko bo backend

type ManualInvoice = {
  uid: string;
  month: string;
  totalAmount: number;
  energyCost: number;
  networkCost: number;
  surcharges: number;
  penalties: number;
  vat: number;
  note?: string;
};

// Dummy data za demo, kasneje dobiš iz backenda z getManualInvoice()
const dummyInvoice: ManualInvoice = {
  uid: "UID123",
  month: "2025-04",
  totalAmount: 44,
  energyCost: 4,
  networkCost: 4,
  surcharges: 4,
  penalties: 4,
  vat: 4,
  note: "",
};

const ReceiptExplanation: React.FC<{ invoice?: ManualInvoice }> = ({ invoice }) => {
  // Če ni podan invoice, uporabljamo dummy
  const inv = invoice ?? dummyInvoice;

  // Helper za lepši prikaz vrednosti
  const fmt = (v: number | string | undefined) => (v !== undefined && v !== "" ? v : "–");

  // Razlaga posameznih polj
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-6 mb-8">
      <h2 className="text-2xl font-bold mb-2">Podrobna razlaga računa za mesec {inv.month}</h2>

      <table className="w-full text-sm border rounded mb-7">
        <tbody>
          <tr className="bg-gray-50">
            <td className="px-4 py-2 font-semibold text-gray-700">Skupni znesek brez DDV</td>
            <td className="px-4 py-2 font-mono">{fmt(inv.totalAmount)} €</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-semibold text-gray-700">Strošek energije</td>
            <td className="px-4 py-2 font-mono">{fmt(inv.energyCost)} €</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="px-4 py-2 font-semibold text-gray-700">Omrežnina</td>
            <td className="px-4 py-2 font-mono">{fmt(inv.networkCost)} €</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-semibold text-gray-700">Prispevki in ostalo</td>
            <td className="px-4 py-2 font-mono">{fmt(inv.surcharges)} €</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="px-4 py-2 font-semibold text-gray-700">Penali</td>
            <td className="px-4 py-2 font-mono">{fmt(inv.penalties)} €</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-semibold text-gray-700">DDV</td>
            <td className="px-4 py-2 font-mono">{fmt(inv.vat)} €</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="px-4 py-2 font-semibold text-gray-700">Opomba</td>
            <td className="px-4 py-2 text-gray-500 font-mono">{fmt(inv.note)}</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-5">
        <FieldExplain
          label="Skupni znesek brez DDV"
          value={inv.totalAmount}
          text={
            <>
              Skupni znesek brez DDV je vsota vseh postavk na računu pred obračunom DDV. Sem spadajo: strošek energije, omrežnina, prispevki, penali in morebitni drugi stroški. Na vašem računu ta znesek znaša <b>{fmt(inv.totalAmount)} €</b>.
            </>
          }
        />
        <FieldExplain
          label="Strošek energije"
          value={inv.energyCost}
          text={
            <>
              Strošek energije prikazuje, koliko ste plačali samo za porabljeno električno energijo. Če imate ločene tarife (VT, MT, ET), seštejte njihove vrednosti. Na računu je to <b>{fmt(inv.energyCost)} €</b>.
            </>
          }
        />
        <FieldExplain
          label="Omrežnina"
          value={inv.networkCost}
          text={
            <>
              Omrežnina je prispevek za uporabo električnega omrežja – plačate ga ne glede na porabo energije. Znesek je običajno ločeno naveden. Na računu znaša <b>{fmt(inv.networkCost)} €</b>.
            </>
          }
        />
        <FieldExplain
          label="Prispevki in ostalo"
          value={inv.surcharges}
          text={
            <>
              Sem sodijo prispevki za obnovljive vire (OVE), učinkovito rabo energije (URE), trošarine in morebitne dodatne storitve. Skupna vrednost je <b>{fmt(inv.surcharges)} €</b>.
            </>
          }
        />
        <FieldExplain
          label="Penali"
          value={inv.penalties}
          text={
            <>
              Penali so dodatni stroški, ki nastanejo, če presežete dogovorjeno moč (npr. 8 kW) ali če kršite druge pogoje pogodbe. Primer: če je vaša dogovorjena moč 8 kW in v nekem trenutku presežete to mejo, dobite penal. Na tem računu je penal <b>{fmt(inv.penalties)} €</b>.
            </>
          }
        />
        <FieldExplain
          label="DDV"
          value={inv.vat}
          text={
            <>
              DDV (22 % na vse storitve) je običajno posebej prikazan. Če ga na računu ni, ga izračunate kot 22 % skupnega zneska brez DDV. Tukaj znaša <b>{fmt(inv.vat)} €</b>.
            </>
          }
        />
        <FieldExplain
          label="Opomba"
          value={inv.note}
          text={
            <>Posebnosti ali opombe za ta račun: {inv.note ? inv.note : <span className="text-gray-400">–</span>}</>
          }
        />
      </div>

      <LegendSection />
    </div>
  );
};

// Komponenta za posamezno polje z razlago
const FieldExplain: React.FC<{ label: string; value: any; text: React.ReactNode }> = ({
  label,
  text,
}) => (
  <div className="bg-gray-50 rounded-lg p-3 border flex items-center gap-4">
    <div className="min-w-[170px] font-bold text-gray-700">{label}:</div>
    <div className="flex-1">{text}</div>
  </div>
);

// Komponenta za legendo in razlago pojmov
const LegendSection: React.FC = () => (
  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
    <div className="font-bold text-lg mb-2">Legenda in razlaga pojmov</div>
    <ul className="text-sm space-y-1">
      <li>
        <span className="font-bold text-blue-700">VT</span> – Visoka tarifa (čez dan)
      </li>
      <li>
        <span className="font-bold text-blue-700">MT</span> – Mala tarifa (ponoči in vikendi)
      </li>
      <li>
        <span className="font-bold text-blue-700">ET</span> – Enotna tarifa (stalna cena)
      </li>
      <li>
        <span className="font-bold">Dogovorjena moč (DM):</span> Najvišja moč (kW), ki jo lahko uporabljate brez penalov. Če jo presežete, dobite penal.
      </li>
      <li>
        <span className="font-bold">Omrežnina:</span> Strošek za uporabo električnega omrežja, neodvisno od porabe.
      </li>
      <li>
        <span className="font-bold">Prispevki:</span> Zakonsko določeni dodatki (OVE, URE, trošarina ...).
      </li>
      <li>
        <span className="font-bold">Penali:</span> Kazni za prekoračitev dogovorjene moči ali druge kršitve.
      </li>
    </ul>
  </div>
);

export default ReceiptExplanation;