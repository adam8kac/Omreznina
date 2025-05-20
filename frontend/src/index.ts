import axios from 'axios';
import { MonthRecord } from './utils/fetchUserMonthlyData';

const api = axios.create({ baseURL: 'http://localhost:8080/' });

export const getDocumentData = async (
	uid: string,
	docId: string,
): Promise<Record<string, MonthRecord>> => {
	const data = await api.get('documents/data?uid=' + uid + '&docId=' + docId);
	const response = data.data;

	return response;
};

export const getUserDocIds = async (uid: string): Promise<Array<string>> => {
	const data = await api.get('documents/documents?uid=' + uid);
	const response = data.data;

	return response;
};
