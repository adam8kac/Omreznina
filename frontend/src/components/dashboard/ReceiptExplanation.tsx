import React from "react";
import { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

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

const explanationTexts: Record<string, string> = {
  "Skupni znesek brez DDV":
    "Vsota vseh postavk pred DDV: strošek energije, omrežnina, prispevki in penali.",
  "Strošek energije":
    "Koliko ste plačali za porabljeno električno energijo (VT/MT/ET tarife).",
  "Omrežnina":
    "Prispevek za uporabo elektro omrežja, neodvisen od porabe energije.",
  "Prispevki in ostalo":
    "Vključuje OVE, URE, trošarine in druge dodatke.",
  "Penali":
    "Kazni za prekoračitev dogovorjene moči (npr. nad 8 kW).",
  "DDV":
    "22 % davek na skupni znesek brez DDV.",
  "Opomba":
    "Posebne opombe, če so bile navedene pri računu.",
};

const InvoiceTable: React.FC<{ invoice?: ManualInvoice }> = ({ invoice }) => {
  const inv = invoice ?? dummyInvoice;
  const [openRow, setOpenRow] = useState<string | null>(null);

  const fmt = (v: number | string | undefined) => (v !== undefined && v !== "" ? `${v} €` : "–");

  const rows = [
    { label: "Skupni znesek brez DDV", value: inv.totalAmount },
    { label: "Strošek energije", value: inv.energyCost },
    { label: "Omrežnina", value: inv.networkCost },
    { label: "Prispevki in ostalo", value: inv.surcharges },
    { label: "Penali", value: inv.penalties },
    { label: "DDV", value: inv.vat },
    { label: "Opomba", value: inv.note || "–" },
  ];

  return (
    <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="text-xl font-semibold mb-4">Podrobna razlaga računa za mesec {inv.month}</h5>

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
            {rows.map((row) => (
              <React.Fragment key={row.label}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-medium text-gray-800">{row.label}</td>
                  <td className="px-6 py-5 font-mono text-gray-700">{fmt(row.value)}</td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => setOpenRow(openRow === row.label ? null : row.label)}
                      className="text-gray-500 hover:text-gray-700 transition"
                      aria-label={`Toggle details for ${row.label}`}
                    >
                      {openRow === row.label ? (
                        <HiChevronUp className="w-5 h-5" />
                      ) : (
                        <HiChevronDown className="w-5 h-5" />
                      )}
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
    </div>
  );
};

export default InvoiceTable;
