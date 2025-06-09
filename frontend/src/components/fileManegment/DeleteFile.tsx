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
  const [showDeleteModal, setShowDeleteModal] = useState<string | boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
    <div className="w-full max-w-6xl mx-auto mt-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Upravljanje podatkov</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upravljaj svoje naložene podatke o računih, dnevnih stanjih in 15-minutnih intervalih za boljši pregled in prikaz porabe.
            Izberi ustrezno možnost glede na to, kaj želiš pregledati ali izbrisati.
          </p>
        </div>
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

        <div className="overflow-x-auto rounded-xl mt-2 max-h-72">
          <table className="w-full text-sm">
            <thead className="bg-blue-200 text-blue-800 uppercase text-xs font-semibold hidden md:table-header-group">
              <tr>
                <th className="px-3 py-3 text-center">Dokument</th>
                <th className="px-3 py-3 text-center">Ogled vsebine</th>
                <th className="px-3 py-3 text-center">Izbriši</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {months?.map((id) => (
                <>
                  <tr key={id} className="hover:bg-gray-50 transition-colors hidden md:table-row">
                    <td className="px-3 py-3 font-medium text-gray-800 text-center">{id}</td>
                    <td className="px-3 py-3 text-center">
                      {uid && selectedDocId && selectedYear && isValidMonth(id) && (
                        <DocDataPopUp
                          uid={uid}
                          docId={selectedDocId}
                          subColId={selectedYear}
                          subDocId={id}
                          buttonStyle="bg-primary text-white rounded-lg px-3 py-2 text-xs font-semibold shadow hover:bg-primary/80"
                        />
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => setShowDeleteModal(id)}
                        className="text-gray-400 hover:text-red-600 text-2xl font-bold px-2 py-1 rounded-full focus:outline-none transition-colors duration-150"
                        title="Izbriši podatek"
                        disabled={deleteLoading}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                  <tr key={id + '-mobile'} className="md:hidden hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === id ? null : id)}>
                    <td className="px-3 py-3 font-medium text-gray-800 text-center" colSpan={3}>{id}</td>
                  </tr>
                  {expandedRow === id && (
                    <tr className="md:hidden">
                      <td colSpan={3} className="px-3 pb-3 pt-0 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {uid && selectedDocId && selectedYear && isValidMonth(id) && (
                            <DocDataPopUp
                              uid={uid}
                              docId={selectedDocId}
                              subColId={selectedYear}
                              subDocId={id}
                              buttonStyle="bg-primary text-white rounded-lg px-3 py-2 text-xs font-semibold shadow hover:bg-primary/80"
                            />
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(id); }}
                            className="text-gray-400 hover:text-red-600 text-2xl font-bold px-2 py-1 rounded-full focus:outline-none transition-colors duration-150"
                            title="Izbriši podatek"
                            disabled={deleteLoading}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {typeof showDeleteModal === 'string' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
              <div className="text-lg font-semibold mb-4 text-red-700">
                Ste prepričani, da želite izbrisati podatek <span className="font-bold">{showDeleteModal}</span>?
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
                  onClick={() => { deleteSubDoc(showDeleteModal); setShowDeleteModal(false); }}
                  disabled={deleteLoading}
                >
                  Izbriši
                </button>
              </div>
            </div>
          </div>
        )}
        {showDeleteModal === true && (
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