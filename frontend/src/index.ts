import axios, { AxiosResponse } from 'axios';

//const api = axios.create({ baseURL: 'https://omreznina-app-latest.onrender.com/' });
const api = axios.create({ baseURL: 'http://localhost:8080/' });

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

export interface ParsedMonth {
  dni: Array<[string, DayRecord]>;
  totalPoraba: number;
  totalSolar: number;
  totalPrejeta?: number;
  tarifaShare?: string;
}

export interface SimulationRequest {
  selectedDevices: string[];
  agreedPowers: Record<number, number>;
  season: 'VISJA' | 'NIZJA';
  dayType: 'DELOVNI_DAN' | 'DELA_PROST_DAN';
}

export interface PredictionRequest {
  uid: string;
  year: string;
  month: string;
}

export interface OverrunStats {
  overruns_count: number;
  avg_penalty: number;
  max_penalty: number;
  avg_peak: number;
  max_peak: number;
  frac_over_85: number;
  avg_temp: number | null;
  forecasted_avg_temp: number | null;
  most_common_overrun_day: string | null;
  most_common_overrun_hour: number | null;
  most_common_overrun_day_in_month: number | null;
  probability_overrun: number;
}

export interface BlockStat {
  block: number;
  avg_peak: number;
  max_peak: number;
  avg_penalty: number;
  count: number;
}

export interface PredictionResponse {
  stats: OverrunStats;
  block_stats: BlockStat[];
  overruns_by_day: Record<string, number>;
  overruns_by_hour: Record<string, number>;
  overruns_by_day_in_month: Record<string, number>;
  error?: string;
}

export interface MfaSettings {
  uid: string;
  enabled: boolean;
  secretHash: string;
}

export const getDocumentData = async (uid: string, docId: string): Promise<Record<string, MonthRecord>> => {
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

export const simulateUsage = async (request: SimulationRequest): Promise<any> => {
  const res = await api.post('api/simulation/simulate', request);
  return res.data;
};

export const uploadManualInvoice = async (request: ManualInvoice): Promise<any> => {
  const res = await api.post('firestore/manual', request);
  return res.data;
};

export const getManualInvoice = async (uid: string, year: string, month: string): Promise<ManualInvoice | null> => {
  const res = await api.get(`firestore/data?uid=${uid}&docId=racuni&subColId=${year}&subColDocId=${month}`);
  return res.data ?? null;
};

export const getAvailableYears = async (uid: string): Promise<string[]> => {
  const res = await api.get(`firestore/subCollections?uid=${uid}&docId=racuni`);
  return res.data;
};

export const getAvailableMonths = async (uid: string, year: string): Promise<string[]> => {
  const res = await api.get(`firestore/docsInSubCol?uid=${uid}&parentDocId=racuni&subcollectionId=${year}`);
  return res.data;
};

export const saveAgreedPowers = async (uid: string, agreedPowers: Record<number, number>): Promise<any> => {
  return api.post('api/simulation/setAgreedPowers', { uid, agreedPowers });
};

export const getAgreedPowers = async (uid: string): Promise<Record<number, number>> => {
  const res = await api.get(`firestore/data?uid=${uid}&docId=dogovorjena-moc`);
  console.log(res.data);
  return res.data;
};

export const getCurrentTariff = async (uid: string) => {
  const response = await api.get(`power/tariff?uid=${uid}`);
  console.log(response.data);
  return response.data;
};

export const getKiloWattHourPrice = async (consumption: number, uid: string) => {
  const response = await api.get(`power/energy-price?consumption=${consumption}&uid=${uid}`);
  return response.data;
};

export const getSubcollectionDocsConsumption = async (
  uid: string,
  parentDocId: string,
  subcollectionId: string
): Promise<string[]> => {
  const res = await api.get(
    `firestore/docsInSubCol?uid=${uid}&parentDocId=${parentDocId}&subcollectionId=${subcollectionId}`
  );
  return res.data;
};

export const getSubcollectionsConsumption = async (uid: string, docId: string): Promise<string[]> => {
  const res = await api.get(`firestore/subCollections?uid=${uid}&docId=${docId}`);
  return res.data;
};

export const getDocumentDataConsumption = async (
  uid: string,
  docId: string,
  subColId?: string,
  subColDocId?: string
): Promise<Record<string, any>> => {
  const params = new URLSearchParams({ uid, docId });
  if (subColId) params.append('subColId', subColId);
  if (subColDocId) params.append('subColDocId', subColDocId);

  const res = await api.get(`firestore/data?${params.toString()}`);
  return res.data;
};

export const uploadMonthlyPower = async (data: FormData) => {
  try {
    const response = await api.post('user/upload-power-consumption', data, {
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

export const uploadMonthlyOptimal = async (data: FormData) => {
  try {
    const response = await api.post('user/optimal-power', data, {
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

export const getCurrentTimeBlock = async () => {
  const response = await api.get('timeBlock/now');
  return response.data;
};

export const saveEt = async (uid: string) => {
  const response = await api.post(`firestore/setEt?uid=${uid}`);
  return response.data;
};

export const removeEtFromDb = async (uid: string) => {
  const response = await api.delete(`power/remove-et?uid=${uid}`);
  return response.data;
};

export const getMfaSettings = async (uid: string): Promise<MfaSettings | null> => {
  try {
    const res = await api.get(`firestore/mfa/${uid}`);
    return res.data;
  } catch {
    return null;
  }
};

export const verifyTotpCode = async (uid: string, code: string): Promise<boolean> => {
  try {
    const res = await api.post('firestore/mfa/verify', { uid, code });
    return res.data === true;
  } catch {
    return false;
  }
};

export const setupMfaSettings = async (uid: string, secret: string, enabled: boolean): Promise<boolean> => {
  try {
    const res: AxiosResponse = await api.post(`firestore/mfa/setup`, {
      uid,
      secret,
      enabled,
    });

    return res.status === 200;
  } catch (error) {
    console.error('Napaka pri setupMfaSettings:', error);
    return false;
  }
};

export const openAiResponse = async (message: string) => {
  try {
    const response = await api.post(`chat/?prompt=${message}`);
    return response.data;
  } catch (error) {
    console.log('napaka pri chatu');
    return false;
  }
};

export const predictMonthlyOverrun = async (req: PredictionRequest): Promise<PredictionResponse> => {
  const { uid, year, month } = req;
  const res = await api.post('/user/prediction/monthly-overrun', {
    uid,
    year,
    month,
  });
  return res.data;
};

export const saveToplotna = async (uid: string, power: number, temparature: number) => {
  try {
    const response = await api.post(`firestore/set-toplotna?uid=${uid}&power=${power}&temparature=${temparature}`);
    return response.data;
  } catch (error) {
    console.log('Could not save toplotna ' + uid + ' power ' + power, error);
  }
};

export const deleteDocument = async (uid: string, docId: string) => {
  try {
    const response = await api.delete(`firestore/remove-document?uid=${uid}&docId=${docId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentWorkinGpowerToplotna = async (uid: string) => {
  try {
    const response = await api.get('/toplotna/get-current-working-power?uid=' + uid);
    return response.data;
  } catch (error) {
    console.log('napaka pri pridobivanju trenutnega delovvanja topotne črpalke');
    return false;
  }
};

export const getToplotnPower = async (uid: string) => {
  const response = await api.get(`firestore/data?uid=${uid}&docId=toplotna-crpalka`);
  return response.data;
};

export const getClientTemparature = async () => {
  try {
    const response = await api.get('/user/current-temparature');
    return response.data;
  } catch (error) {
    console.log('napaka pri pridobivanju trenutne temparature');
    return false;
  }
};

export const deleteSubDocument = async (uid: string, docId: string, subColId: string, subDocId: string) => {
  try {
    const response = await api.delete(
      `firestore/remove-subDocument?uid=${uid}&docId=${docId}&subColId=${subColId}&subDocId=${subDocId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCustomDocData = async (uid: string, docId: string, subColId: string, subDocId: string) => {
  const response = await api.get(
    `firestore/data?uid=${uid}&docId=${docId}&subColId=${subColId}&subColDocId=${subDocId}`
  );
  return response.data;
};

export const deleteData = async (uid: string, docId: string) => {
  try {
    const response = await api.delete(`firestore/remove?uid=${uid}&docId=${docId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
