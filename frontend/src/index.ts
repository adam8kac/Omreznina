import axios from 'axios';

const api = axios.create({ baseURL: 'https://omreznina-app-latest.onrender.com/' });
//const api = axios.create({ baseURL: 'http://localhost:8080/' });


export interface DayRecord {
  poraba: number;
  solar: number;
}

export interface MonthRecord {
  dni: Record<string, DayRecord>;
  totalPoraba: number;
  totalSolar: number;
}

export interface ManualInvoice {
  uid: string;
  month: string;         
  totalAmount: number;
  energyCost: number;
  networkCost: number;
  surcharges: number;
  penalties: number;
  vat: number;
  note?: string;
}

export const getDocumentData = async (
  uid: string,
  docId: string
): Promise<Record<string, MonthRecord>> => {
  const res = await api.get(`firestore/data?uid=${uid}&docId=${docId}`);
  return res.data;
};

export const getUserDocIds = async (uid: string): Promise<string[]> => {
  const res = await api.get(`firestore/documents?uid=${uid}`);
  return res.data;
};

export const uploadMonthlyFile = async (data: FormData) => {
  try {
    const response = await api.post('user/upload-file', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(response);
  } catch (error) {
    console.log(error);
    alert('Napaka pri nalaganju.');
  }

};

export const getAvailableDevices = async (): Promise<string[]> => {
	const res = await api.get('api/simulation/available-devices');
	return res.data;
};

export interface SimulationRequest {
	selectedDevices: string[];
	agreedPowers: Record<number, number>;
	season: 'VISJA' | 'NIZJA';
	dayType: 'DELOVNI_DAN' | 'DELA_PROST_DAN';
}

export const simulateUsage = async (request: SimulationRequest): Promise<any> => {
	const res = await api.post('api/simulation/simulate', request);
	return res.data;
};

export const uploadManualInvoice = async (request: ManualInvoice): Promise<any> => {
	const res = await api.post('firestore/manual', request);
	return res.data;
};

export const getManualInvoice = async (
  uid: string,
  year: string,
  month: string
): Promise<ManualInvoice | null> => {
  const res = await api.get(
    `firestore/data?uid=${uid}&docId=racuni&subColId=${year}&subColDocId=${month}`
  );
  return res.data ?? null;
};

export const getAvailableYears = async (uid: string): Promise<string[]> => {
  const res = await api.get(`firestore/subCollections?uid=${uid}&docId=racuni`);
  return res.data;
};

export const getAvailableMonths = async (
  uid: string,
  year: string
): Promise<string[]> => {
  const res = await api.get(
    `firestore/docsInSubCol?uid=${uid}&parentDocId=racuni&subcollectionId=${year}`
  );
  return res.data;
};

export const saveAgreedPowers = async (
  uid: string,
  agreedPowers: Record<number, number>
): Promise<any> => {
  return api.post("api/simulation/setAgreedPowers", { uid, agreedPowers });
};

export const getAgreedPowers = async (uid: string): Promise<Record<number, number>> => {
  const res = await api.get(`api/simulation/getAgreedPowers?uid=${uid}`);
  return res.data;
};

