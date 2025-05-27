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
  "Skupni znesek brez DDV": "Vsota vseh postavk pred DDV: strošek energije, omrežnina, prispevki in penali.",
  "Strošek energije": "Koliko ste plačali za porabljeno električno energijo (VT/MT/ET tarife).",
  "Omrežnina": "Prispevek za uporabo elektro omrežja, neodvisen od porabe energije.",
  "Prispevki in ostalo": "Vključuje OVE, URE, trošarine in druge dodatke.",
  "Penali": "Kazni za prekoračitev dogovorjene moči (npr. nad 8 kW).",
  "DDV": "22 % davek na skupni znesek brez DDV.",
  "Opomba": "Posebne opombe, če so bile navedene pri računu.",
};

const InvoiceTable: React.FC = () => {
  const [invoice, setInvoice] = useState<ManualInvoice | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [openRow, setOpenRow] = useState<string | null>(null);
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
    <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="text-xl font-semibold mb-4">Račun na kratko</h5>
      <p className="text-gray-600 mb-4">
        Hiter in jasen pregled tvojega računa. Izberi leto in mesec ter si oglej, kako je sestavljen tvoj strošek za elektriko.      </p>
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <div>
          <label className="block text-sm mb-1">Izberi leto:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 rounded border"
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
              className="p-2 rounded border"
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
                <th className="px-6 py-5 text-right">Podrobnosti</th>
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
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 font-medium text-gray-800">{row.label}</td>
                    <td className="px-6 py-5 font-mono text-gray-700">
                      {fmt(row.value, row.label)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setOpenRow(openRow === row.label ? null : row.label)}
                        className="text-gray-500 hover:text-gray-700 transition"
                        aria-label={`Toggle details for ${row.label}`}
                      >
                        {openRow === row.label ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                  {openRow === row.label && (
                    <tr className="bg-blue-50">
                      <td colSpan={3} className="px-6 py-5 text-sm text-blue-800">
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
