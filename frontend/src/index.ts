import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/' });

// ⬇️ TIPI PODATKOV
export interface DayRecord {
  poraba: number; // poraba iz omrežja (negativna ali pozitivna)
  solar: number;  // solarna proizvodnja (pozitivna)
}

export interface MonthRecord {
  dni: Record<string, DayRecord>;
  totalPoraba: number;
  totalSolar: number;
}

// ⬇️ API FUNKCIJE
export const getDocumentData = async (
  uid: string,
  docId: string
): Promise<Record<string, MonthRecord>> => {
  const res = await api.get(`documents/data?uid=${uid}&docId=${docId}`);
  return res.data;
};

export const getUserDocIds = async (uid: string): Promise<string[]> => {
  const res = await api.get(`documents/documents?uid=${uid}`);
  return res.data;
};
