export interface DayRecord {
	poraba: number; // koliko je bilo porabljeno (iz omrežja)
	solar: number; // koliko je bilo proizvedeno s sončno elektrarno
}

export interface MonthRecord {
	dni: Record<string, DayRecord>;
	totalPoraba: number;
	totalSolar: number
}