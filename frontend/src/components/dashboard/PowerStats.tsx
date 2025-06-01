import { getAuth } from 'firebase/auth';
import { Select } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getDocumentDataConsumption, getSubcollectionDocsConsumption, getSubcollectionsConsumption } from 'src/index';
import { BarChart } from '@mui/x-charts/BarChart';

export const PowerStats = () => {
  const [years, setYears] = useState<string[] | null>(null);
  const [months, setMonths] = useState<string[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [formatedDate, setFormatedDate] = useState<string>();
  const [uid, setUid] = useState<string>();
  const [prekoracitveData, setPrekoracitveData] = useState<Record<string, any> | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [optimumData, setOptimumData] = useState<Record<string, any> | null>(null);
  const [moneySpent, setMoneySpent] = useState<number>(); //dejnaksa vrednost
  const [optimumMoneySpent, setOptimumMoneySpent] = useState<number>(); // optimum cene
  const blockColors: Record<number, string> = {
    1: '#fa144d',
    2: '#faa63e',
    3: '#FFD900',
    4: '#2FBE8F',
    5: '#B8D900',
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setUid(user.uid);
  }, []);

  useEffect(() => {
    if (!uid) return;
    getSubcollectionsConsumption(uid, 'prekoracitve').then((loadedYears) => {
      setYears(loadedYears);
      if (loadedYears && loadedYears.length > 0) setSelectedYear(loadedYears[0]);
    });
  }, [uid]);

  useEffect(() => {
    if (!uid || !selectedYear) return;
    getSubcollectionDocsConsumption(uid, 'prekoracitve', selectedYear).then((monthsArr) => {
      if (monthsArr) {
        // Sort months in ascending order (e.g., '01', '02', ...)
        const sortedMonths = [...monthsArr].sort();
        setMonths(sortedMonths);
      } else {
        setMonths(monthsArr);
      }
    });
  }, [selectedYear, uid]);

  useEffect(() => {
    if (months && months.length > 0) {
      setSelectedMonth(months[0]);
    }
  }, [months]);

  useEffect(() => {
    if (!uid || !selectedYear || !selectedMonth) return;
    getDocumentDataConsumption(uid, 'prekoracitve', selectedYear, selectedMonth).then(setPrekoracitveData);
    getDocumentDataConsumption(uid, 'optimum', selectedYear, selectedMonth).then(setOptimumData);
  }, [uid, selectedYear, selectedMonth]);

  console.log(optimumData);

  useEffect(() => {
    if (!prekoracitveData) return;
    Object.entries(prekoracitveData).forEach(([k, v]) => {
      if (k == 'total monthly price') {
        setMoneySpent(v);
      }
    });
  }, [prekoracitveData]);

  useEffect(() => {
    if (!optimumData) return;
    Object.entries(optimumData).forEach(([k, v]) => {
      if (k == 'total monthly price') {
        setOptimumMoneySpent(v);
      }
    });
  }, [optimumData]);

  console.log('dejansko: ' + moneySpent, 'Optimalno: ' + optimumMoneySpent);
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      const monthNames: Record<string, string> = {
        '01': 'Januar',
        '02': 'Februar',
        '03': 'Marec',
        '04': 'April',
        '05': 'Maj',
        '06': 'Junij',
        '07': 'Julij',
        '08': 'Avgust',
        '09': 'September',
        '10': 'Oktober',
        '11': 'November',
        '12': 'December',
      };
      setFormatedDate(`${monthNames[selectedMonth] || selectedMonth} ${selectedYear}`);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (prekoracitveData) {
      const dayMap: Record<string, any> = {};

      Object.entries(prekoracitveData).forEach(([key, entry]) => {
        if (key === 'total monthly price') return;

        if (typeof entry === 'object' && entry !== null && Array.isArray(entry.data)) {
          entry.data.forEach((item: any) => {
            if (
              item.timestamp &&
              item.maxPowerRecieved !== undefined &&
              item.block !== undefined &&
              item['delta power'] !== undefined
            ) {
              const day = item.timestamp.split('-')[0];
              const blockNum = item.block;
              const blockKey = `b${blockNum}`;
              const total = parseFloat(item.maxPowerRecieved);
              const delta = parseFloat(item['delta power']);
              const normal = total - delta;

              if (!dayMap[day]) dayMap[day] = { day };

              dayMap[day][`${blockKey}_normal`] = (dayMap[day][`${blockKey}_normal`] || 0) + normal;
              if (delta > 0) {
                dayMap[day][`${blockKey}_excess`] = (dayMap[day][`${blockKey}_excess`] || 0) + delta;
              }
            }
          });
        }
      });

      // Sort chartData by day (as number)
      const sortedChartData = Object.values(dayMap).sort((a, b) => Number(a.day) - Number(b.day));
      setChartData(sortedChartData);
    }
  }, [prekoracitveData]);

  const getMonthName = (month: string) => {
    const names: Record<string, string> = {
      '01': 'Januar',
      '02': 'Februar',
      '03': 'Marec',
      '04': 'April',
      '05': 'Maj',
      '06': 'Junij',
      '07': 'Julij',
      '08': 'Avgust',
      '09': 'September',
      '10': 'Oktober',
      '11': 'November',
      '12': 'December',
    };
    return names[month] || month;
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block mb-1">Izberi leto:</label>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years?.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Izberi mesec:</label>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months?.map((month) => (
            <option key={month} value={month}>
              {getMonthName(month)} {selectedYear}
            </option>
          ))}
        </Select>
      </div>

      {formatedDate && <h2 className="text-lg font-bold mb-4">Prejem moči po blokih za {formatedDate}</h2>}

      {chartData.length > 0 ? (
        <BarChart
          dataset={chartData}
          xAxis={[{ dataKey: 'day', label: 'Dan v mesecu' }]}
          series={Array.from(new Set(chartData.flatMap((d) => Object.keys(d).filter((k) => k !== 'day'))))
            .sort((a, b) => {
              const na = parseInt(a.match(/\d+/)?.[0] || '0');
              const nb = parseInt(b.match(/\d+/)?.[0] || '0');
              const ea = a.includes('excess') ? 1 : 0;
              const eb = b.includes('excess') ? 1 : 0;
              return na - nb || ea - eb;
            })
            .map((key) => {
              const blockNum = parseInt(key.match(/\d+/)?.[0] || '0');
              const isExcess = key.includes('excess');
              return {
                dataKey: key,
                label: isExcess ? `Blok ${blockNum} (prekoračitev)` : `Blok ${blockNum}`,
                color: isExcess ? '#FF0000' : blockColors[blockNum],
                stack: `block-${blockNum}`,
              };
            })}
          height={400}
        />
      ) : (
        <p className="text-gray-500">Ni podatkov za prikaz.</p>
      )}
    </div>
  );
};
