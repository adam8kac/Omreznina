package feri.um.si.omreznina.holidayCheckerTest;

import org.junit.jupiter.api.Test;

import feri.um.si.omreznina.helper.HolidayChecker;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;

public class HolidayCheckerTest {

	private final HolidayChecker checker = new HolidayChecker();

	@Test
	public void shouldReturnTrueForKnownHoliday() {
		// Na primer: Novo leto v Sloveniji
		LocalDate newYearsDay = LocalDate.of(2025, 01, 01);
		assertTrue(checker.isHoliday(newYearsDay), "1. januar mora biti praznik");
	}

	@Test
	public void shouldReturnFalseForNonHoliday() {
		LocalDate regularDay = LocalDate.of(2025, 3, 5);
		assertFalse(checker.isHoliday(regularDay), "4. marec ni praznik");
	}
}
