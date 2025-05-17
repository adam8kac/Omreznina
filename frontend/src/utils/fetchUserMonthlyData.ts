import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "src/firebase-config";

export interface DayRecord {
  poraba: number; // koliko je bilo porabljeno (iz omrežja)
  solar: number;  // koliko je bilo proizvedeno s sončno elektrarno
}

export interface MonthRecord {
  dni: Record<string, DayRecord>;
  totalPoraba: number;
  totalSolar: number;
}

export const fetchUserMonthlyData = async (): Promise<Record<string, MonthRecord>> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Uporabnik ni prijavljen.");

  const userRef = collection(db, user.uid);
  const monthsSnapshot = await getDocs(userRef);

  const data: Record<string, MonthRecord> = {};

  for (const docSnap of monthsSnapshot.docs) {
    const monthKey = docSnap.id; // npr. "2025-04"
    const monthData = docSnap.data();

    const dni: Record<string, DayRecord> = {};
    let totalPoraba = 0;
    let totalSolar = 0;

    const sortedEntries = Object.entries(monthData).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );

    for (const [day, value] of sortedEntries) {
      if (typeof value === "object" && value !== null) {
        const poraba = Number(value["delta oddana delovna energija et"] ?? 0);
        const solar = Number(value["delta prejeta delovna energija et"] ?? 0);

        const dayPart = day.split("-")[2]?.padStart(2, "0") || day;

        dni[dayPart] = {
          poraba: parseFloat(poraba.toFixed(3)),
          solar: parseFloat(solar.toFixed(3)),
        };

        totalPoraba += poraba;
        totalSolar += solar;
      }
    }

    data[monthKey] = {
      dni,
      totalPoraba: parseFloat(totalPoraba.toFixed(3)),
      totalSolar: parseFloat(totalSolar.toFixed(3)),
    };
  }

  return data;
};
