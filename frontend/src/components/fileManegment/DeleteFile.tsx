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
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    setShowDeleteModal(true);
  };

  const confirmDeleteAll = async () => {
    setDeleteLoading(true);
    try {
      await deleteDocument(uid!, selectedDocId!);
      setStatus({ message: 'Vsi podatki uspešno izbrisani.', type: 'success' });
      setMonths([]);
    } catch {
      setStatus({ message: 'Napaka pri brisanju.', type: 'error' });
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  const deleteSubDoc = async (subDocId: string) => {
    if (!uid || !selectedDocId || !selectedYear) return;
    setDeleteLoading(true);
    try {
      await deleteSubDocument(uid, selectedDocId, selectedYear, subDocId);
      setStatus({ message: 'Podatek izbrisan.', type: 'success' });
      const refreshedMonths = await getSubcollectionDocsConsumption(uid, selectedDocId, selectedYear);
      setMonths(refreshedMonths?.sort() || null);
    } catch {
      setStatus({ message: 'Napaka pri brisanju.', type: 'error' });
    }
    setDeleteLoading(false);
  };

  const isValidMonth = (monthId: string) => months?.includes(monthId);

  return (
    <div className="w-full flex justify-center py-10 px-4 sm:px-6 md:px-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100">
        <h2 className="text-2xl font-bold mb-7 text-center">Upravljanje podatkov</h2>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start items-end mb-8">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Izberi tip podatkov</label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="rounded-lg border border-primary px-3 py-2 bg-gray-50 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition min-w-[120px]"
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
              className="rounded-lg border border-primary px-3 py-2 bg-gray-50 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition min-w-[120px]"
            >
              {years?.map((year: string) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={deleteDoc}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm ml-2 font-semibold"
          >
            Izbriši vse
          </button>
        </div>
        {status.message && (
          <div
            className={`text-center mb-5 py-2 rounded-lg font-medium ${
              status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* List of months/docs */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-2 py-1 max-h-[300px] overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Dokument</th>
                <th className="px-4 py-2 text-center">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {months?.map((id) => (
                <tr key={id} className="border-b last:border-0">
                  <td className="px-4 py-2">{id}</td>
                  <td className="px-4 py-2 flex gap-2 justify-end">
                    {uid && selectedDocId && selectedYear && isValidMonth(id) && (
                      <DocDataPopUp
                        uid={uid}
                        docId={selectedDocId}
                        subColId={selectedYear}
                        subDocId={id}
                        buttonStyle="bg-primary text-white rounded-lg px-4 py-2 text-xs font-semibold shadow hover:bg-primary/80"
                      />
                    )}
                    <button
                      onClick={() => deleteSubDoc(id)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow"
                      disabled={deleteLoading}
                    >
                      Izbriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal for deleting ALL */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
              <div className="text-lg font-semibold mb-4 text-red-700">
                Ste prepričani, da želite izbrisati VSE podatke za izbrani tip?
              </div>
              <div className="mb-6 text-gray-600 text-sm">Ta operacija je nepovratna!</div>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-medium"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Prekliči
                </button>
                <button
                  className="px-5 py-2 rounded bg-red-600 text-white font-medium"
                  onClick={confirmDeleteAll}
                  disabled={deleteLoading}
                >
                  Izbriši vse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteFile;