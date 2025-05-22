import axios from 'axios';

const api = axios.create({ baseURL: 'https://omreznina-app-latest.onrender.com/' });


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

//simulacija klici
export const getAvailableDevices = async (): Promise<string[]> => {
	const res = await api.get('/api/simulation/available-devices');
	return res.data;
};

export interface SimulationRequest {
	selectedDevices: string[];
	agreedPowers: Record<number, number>;
	season: 'VISJA' | 'NIZJA';
	dayType: 'DELOVNI_DAN' | 'DELA_PROST_DAN';
}

export const simulateUsage = async (request: SimulationRequest): Promise<any> => {
	const res = await api.post('/api/simulation/simulate', request);
	return res.data;
};

export async function uploadManualInvoice(invoice: ManualInvoice) {
  const res = await fetch('http://localhost:8080/firestore/manual', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text(); 
}