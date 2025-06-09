import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  deleteDocument,
  deleteSubDocument,
  getSubcollectionDocsConsumption,
  getSubcollectionsConsumption,
  getUserDocIds,
} from 'src/index';
import { DocDataPopUp } from './PopUpDocData';

const DeleteFile = () => {
  const [years, setYears] = useState<string[] | null>(null);
  const [months, setMonths] = useState<string[] | null>(null);
  const [docs, setDocs] = useState<string[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [selectedDocId, setSelectedDocId] = useState<string>('prekoracitve');
  const [uid, setUid] = useState<string>();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setUid(user.uid);
  }, []);

  useEffect(() => {
    if (!uid) return;
    getUserDocIds(uid).then((data) => {
      if (data) {
        const filtered = Object.values(data).filter(
          (value) => !['et', 'mfa', 'toplotna-crpalka', 'dogovorjena-moc'].includes(value)
        );
        const unique = Array.from(new Set(filtered));
        setDocs(unique);
      }
    });
  }, [uid]);
  useEffect(() => {
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
    setYears(null);
    setMonths(null);
  }, [selectedDocId]);

  useEffect(() => {
    if (!uid) return;
    getSubcollectionsConsumption(uid, selectedDocId).then(setYears);
  }, [uid, selectedDocId]);

  useEffect(() => {
    if (years?.length && !selectedYear) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  useEffect(() => {
    if (!uid || !selectedYear) return;
    getSubcollectionDocsConsumption(uid, selectedDocId, selectedYear).then((monthsArr) => {
      setMonths(monthsArr?.sort() || null);
    });
  }, [selectedDocId, selectedYear, uid]);

  useEffect(() => {
    if (months?.length && !selectedMonth) setSelectedMonth(months[0]);
  }, [months, selectedMonth]);

  const deleteDoc = async () => {
    if (!uid || !selectedDocId) return;
    console.log(uid, selectedDocId);
    await deleteDocument(uid, selectedDocId);
  };

  const deleteSubDoc = async (subDocId: string) => {
    console.log(uid, selectedDocId, selectedYear, subDocId);
    if (!uid || !selectedDocId || !selectedYear) return;
    await deleteSubDocument(uid, selectedDocId, selectedYear, subDocId);

    const refreshedMonths = await getSubcollectionDocsConsumption(uid, selectedDocId, selectedYear);
    setMonths(refreshedMonths?.sort() || null);
  };

  const isValidMonth = (monthId: string) => {
    return months?.includes(monthId);
  };

  return (
    <>
      <div className="p-6 bg-white space-y-8">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start items-end">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Izberi tip dokumenta</label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="rounded-lg border border-violet-400 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition min-w-[120px]"
            >
              {docs?.map((doc: string) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Izberi leto</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-lg border border-violet-400 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition min-w-[120px]"
            >
              {years?.map((year: string) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => deleteDoc()}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
            >
              Izbriši vse dokumente
            </button>
          </div>

          <table className="min-w-full border border-gray-200 mt-4">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border-b">Dokument</th>
              </tr>
            </thead>
            <tbody>
              {months?.map((id) => (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{id}</td>
                  <td className="px-4 py-2 border-b text-right">
                    {uid && selectedDocId && selectedYear && isValidMonth(id) && (
                      <DocDataPopUp uid={uid} docId={selectedDocId} subColId={selectedYear} subDocId={id} />
                    )}

                    <button
                      onClick={() => deleteSubDoc(id)}
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                      }}
                    >
                      Izbriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DeleteFile;
