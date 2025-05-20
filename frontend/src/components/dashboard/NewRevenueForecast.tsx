import { useEffect, useState } from 'react';
import { getDocumentData, getUserDocIds } from 'src/index';
import { MonthRecord } from 'src/utils/fetchUserMonthlyData';

// Vrne vse podatke v dokumetno inj doda tatum ki je kljuc v Recordu<datum, podatki> --> da ga v zapis
const getData = async (uid: string, docId: string): Promise<MonthRecord[]> => {
	const docData = await getDocumentData(uid, docId);
	return Object.values(docData) as MonthRecord[];
};

// klice getdata pa vrne v obliki [month, podatki[{zapis1}, {zapis2}, ...]]
const getAllData = async (uid: string): Promise<Array<[string, MonthRecord[]]>> => {
	const months: Array<string> = await getUserDocIds(uid);
	const allData = await Promise.all(
		months.map(async (month) => {
			const docData = await getData(uid, month);

			return [month, docData] as [string, MonthRecord[]];
		}),
	);

	return allData;
};

const dataByMonth = async (uid: string, month: string) => {
	const fullData = await getData(uid, month);
	const filteredData = fullData[0];
	console.log(filteredData);

	// Object.values(filteredData).map((k, v) => {
	// 	// console.log('value:', v, ' key: ', k);
	// 	Object.values(v); //data brez array {data1},{data2}...
	// });
	console.log(Object.values(filteredData)); //values == data v array [{data1}, {data2}, ...]
	console.log(Object.keys(filteredData)); //datumi
};

export const NewRevenueForecast = () => {
	const [data, setData] = useState<Array<[string, MonthRecord[]]>>([]);

	useEffect(() => {
		const fetchData = async () => {
			const result = await getAllData('HhpJnm4RPIhBBmRHgAHCxHjEuKn2');
			setData(result);
			dataByMonth('HhpJnm4RPIhBBmRHgAHCxHjEuKn2', '2024-08');
			console.log(result);
		};
		fetchData();
	}, []);

	return (
		<>
			<p>Hello: {JSON.stringify(data)}</p>
		</>
	);
};
