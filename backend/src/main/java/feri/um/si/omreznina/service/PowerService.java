package feri.um.si.omreznina.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.stereotype.Service;

import feri.um.si.omreznina.helper.HolidayChecker;
import feri.um.si.omreznina.model.Tariff;
import feri.um.si.omreznina.type.TariffType;

@Service
public class PowerService {
	private final HolidayChecker holidayChecker;
	private final FirestoreService firestoreService;

	public PowerService(HolidayChecker holidayChecker, FirestoreService firestoreService) {
		this.holidayChecker = holidayChecker;
		this.firestoreService = firestoreService;
	}

	public Tariff getTariff(String uid) {
		Tariff tariff = new Tariff(setType(uid));
		return tariff;
	}

	public double getPricePerHour(double energyConsumed, String uid) {
		Tariff tariff = getTariff(uid);
		double pricePerkWH = tariff.getPrice();
		double priceToPay = pricePerkWH * energyConsumed;
		return priceToPay;
	}

	public void removeEtFromDb(String uid) {
		firestoreService.removeDocument(uid, "et");
	}

	private TariffType setType(String uid) {
		LocalDate date = LocalDate.now();

		if (firestoreService.getTariff(uid) instanceof Tariff) {
			return TariffType.ET;
		} else if (holidayChecker.isHoliday(date) || isInTimeRnage() || isWeekend()) {
			return TariffType.MT;
		} else {
			return TariffType.VT;
		}
	}

	private boolean isInTimeRnage() {
		LocalTime currentTime = LocalTime.now();
		int currentHour = currentTime.getHour();
		int[] mtHours = { 22, 23, 1, 2, 3, 4, 5, 6 };

		for (int hour : mtHours) {
			if (currentHour == hour) {
				return true;
			}
		}
		return false;
	}

	private boolean isWeekend() {
		DayOfWeek[] weekends = { DayOfWeek.SATURDAY, DayOfWeek.SUNDAY };
		DayOfWeek today = LocalDate.now().getDayOfWeek();

		for (DayOfWeek day : weekends) {
			if (day.equals(today)) {
				return true;
			}
		}
		return false;
	}
}
