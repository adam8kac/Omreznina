import axios from 'axios';

const api = axios.create({ baseURL: 'https://omreznina-app-latest.onrender.com/' });

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

//simulacija
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

