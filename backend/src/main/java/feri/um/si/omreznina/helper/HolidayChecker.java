package feri.um.si.omreznina.helper;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class HolidayChecker {
	List<String> nonWorkingHolidays = List.of(
			"01-01",
			"01-02",
			"02-08",
			"04-20",
			"04-21",
			"04-27",
			"05-01",
			"05-02",
			"06-08",
			"06-25",
			"08-15",
			"10-31",
			"11-01",
			"12-25",
			"12-26");

	public boolean isHoliday(LocalDate date) {
		int month = date.getMonthValue();
		int day = date.getDayOfMonth();
		String newDate = String.format("%02d-%02d", month, day);

		for (String holiday : nonWorkingHolidays) {
			if (holiday.equals(newDate)) {
				return true;
			}
		}
		return false;
	}
}
