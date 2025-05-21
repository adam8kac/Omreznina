import axios from 'axios';
import { MonthRecord } from './utils/fetchUserMonthlyData';

const api = axios.create({ baseURL: 'https://omreznina-app-latest.onrender.com/' });

// klcie springa da dobi podatke enega dokumenta
export const getDocumentData = async (uid: string, docId: string): Promise<Record<string, MonthRecord>> => {
  const data = await api.get('firestore/data?uid=' + uid + '&docId=' + docId);
  const response = data.data;

  return response;
};

// klice springa da dobi userjeve docse(idje)
export const getUserDocIds = async (uid: string): Promise<Array<string>> => {
  const data = await api.get('firestore/documents?uid=' + uid);
  const response = data.data;

  return response;
};

// klic na springa da lahko nalozi tiste mesecne pdoatke
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
