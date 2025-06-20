import React, { useEffect, useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import {
  getManualInvoice,
  getAvailableMonths,
  getAvailableYears,
  ManualInvoice,
} from "src/index";
import { auth } from "src/firebase-config";

const explanationTexts: Record<string, string> = {
  "Skupni znesek brez DDV": "Vsota vseh postavk na računu pred obračunom DDV, vključno s stroškom energije, omrežnino, prispevki in morebitnimi penali. Predstavlja osnovo za izračun davka in skupnega zneska za plačilo.", 
  "Strošek energije": "Znesek, ki odraža strošek porabljene električne energije v obračunskem obdobju, razdeljen po tarifah (visoka, nizka in posebna tarifa). Cena temelji na dejanski porabi v kilovatnih urah (kWh).",
  "Omrežnina": "Fiksni prispevek za uporabo in vzdrževanje elektroenergetskega omrežja, ki je neodvisen od količine porabljene energije. Omrežnina zagotavlja stabilno delovanje in dostopnost omrežja.",
  "Prispevki in ostalo": "Vključuje različne dodatne stroške, kot so prispevki za obnovljive vire energije (OVE), razvojne prispevke za učinkovito rabo energije (URE), trošarine in druge zakonsko določene dodatke.",
  "Penali": "Kazni zaradi prekoračitve dogovorjene največje moči priključka, namenjene spodbujanju racionalne porabe in preprečevanju preobremenitve omrežja. Višina kazni je določena v pogodbi.",
  "DDV": "Davek na dodano vrednost v višini 22 %, ki se obračuna na skupni znesek brez DDV. DDV je zakonsko določen davek, ki se dodaja na osnovno ceno storitev in blaga.",
  "Opomba": "Posebne informacije ali dodatna pojasnila, ki so navedena na računu, kot so opozorila, pogoji ali druge pomembne opombe za uporabnika.",
};



const InvoiceTable: React.FC = () => {
  const [invoice, setInvoice] = useState<ManualInvoice | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const keyId = auth.config.apiKey;
  const userSessionid = "firebase:authUser:" + keyId + ":[DEFAULT]";

  const getUid = (): string => {
    const sessionUser = sessionStorage.getItem(userSessionid);
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        if ("uid" in user) {
          return user.uid;
        }
      } catch {}
    }
    return "";
  };

  useEffect(() => {
    const uid = getUid();
    if (!uid) return;

    getAvailableYears(uid)
      .then(setYears)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const uid = getUid();
    if (!uid || !selectedYear) return;

    setInvoice(null);
    setSelectedMonth("");
    getAvailableMonths(uid, selectedYear)
      .then(setMonths)
      .catch(console.error);
  }, [selectedYear]);

  useEffect(() => {
    const uid = getUid();
    if (!uid || !selectedYear || !selectedMonth) return;

    setLoading(true);
    getManualInvoice(uid, selectedYear, selectedMonth)
      .then(setInvoice)
      .catch((err) => {
        console.error(err);
        setInvoice(null);
      })
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const fmt = (value: string | number | undefined, label: string) => {
    if (label === "Opomba") return value || "–";
    return value !== undefined && value !== "" ? `${value} €` : "–";
  };

  return (
    <div className="bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="text-3xl font-bold mb-4 text-center">Račun na kratko</h5>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto text-center">
        Hiter in jasen pregled tvojega računa. Izberi leto in mesec ter si oglej, kako je sestavljen tvoj strošek za elektriko.
      </p>
      <br />
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <div>
          <label className="block text-sm mb-1">Izberi leto:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 rounded-xl border"
          >
            <option value="">--</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {selectedYear && (
          <div>
            <label className="block text-sm mb-1">Izberi mesec:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 rounded-xl border"
            >
              <option value="">--</option>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <p>Nalaganje ...</p>}

      {!loading && (!selectedYear || !selectedMonth) && (
        <p className="text-purple-600 text-center">
          Za prikaz podatkov in razlage računa izberi leto in mesec, za katerega želiš vpogled.
        </p>
      )}

      {!loading && selectedMonth && !invoice && (
        <p>Ni podatkov za izbran mesec.</p>
      )}

      {invoice && (
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-blue-200 text-blue-800 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-5 text-left">Postavka</th>
                <th className="px-6 py-5 text-left">Znesek</th>
                <th className="px-6 py-5 text-right hidden sm:table-cell">Podrobnosti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { label: "Skupni znesek brez DDV", value: invoice.totalAmount },
                { label: "Strošek energije", value: invoice.energyCost },
                { label: "Omrežnina", value: invoice.networkCost },
                { label: "Prispevki in ostalo", value: invoice.surcharges },
                { label: "Penali", value: invoice.penalties },
                { label: "DDV", value: invoice.vat },
                { label: "Opomba", value: invoice.note || "–" },
              ].map((row) => (
                <React.Fragment key={row.label}>
                  <tr
                    className="hover:bg-gray-50 transition-colors cursor-pointer sm:cursor-default"
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setOpenRows((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(row.label)) {
                            newSet.delete(row.label);
                          } else {
                            newSet.add(row.label);
                          }
                          return newSet;
                        });
                      }
                    }}
                  >
                    <td className="px-6 py-5 font-medium text-gray-800">{row.label}</td>
                    <td className="px-6 py-5 font-mono text-gray-700">{fmt(row.value, row.label)}</td>
                    <td className="px-6 py-5 text-right hidden sm:table-cell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenRows((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(row.label)) {
                              newSet.delete(row.label);
                            } else {
                              newSet.add(row.label);
                            }
                            return newSet;
                          });
                        }}
                        className="text-gray-500 hover:text-gray-700 transition"
                        aria-label={`Toggle details for ${row.label}`}
                      >
                        {openRows.has(row.label) ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                  {openRows.has(row.label) && (
                    <tr>
                      <td colSpan={3} className="px-6 pb-4 pt-0 text-xs text-blue-800 sm:hidden">
                        <span className="font-semibold">{row.label}</span>: {explanationTexts[row.label]}
                      </td>
                      <td colSpan={3} className="px-6 py-5 text-sm text-blue-800 hidden sm:table-cell bg-blue-50">
                        <span className="font-semibold">{row.label}</span>: {explanationTexts[row.label]}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
