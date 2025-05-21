package feri.um.si.omreznina.timeblockTest;

import feri.um.si.omreznina.helper.HolidayChecker;
import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.model.TimeRange;
import feri.um.si.omreznina.resolver.TimeBlockBuilder;
import feri.um.si.omreznina.service.TimeBlockService;
import feri.um.si.omreznina.type.DayType;
import feri.um.si.omreznina.type.SeasonType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

public class TimeBlockServiceTest {

	private HolidayChecker holidayChecker;
	private TimeBlockBuilder builder;
	private TimeBlockService timeBlockService;

	@BeforeEach
	void setUp() {
		holidayChecker = new HolidayChecker();
		builder = new TimeBlockBuilder();
		timeBlockService = new TimeBlockService(builder, holidayChecker);
	}

	@Test
	void testIsHolidayTrue() {
		assertTrue(holidayChecker.isHoliday(LocalDate.of(2024, 1, 1)));
	}

	@Test
	void testIsHolidayFalse() {
		assertFalse(holidayChecker.isHoliday(LocalDate.of(2024, 3, 5)));
	}

	@Test
	void testTimeRangeNormal() {
		TimeRange range = new TimeRange("08:00", "12:00");
		assertTrue(range.contains(LocalTime.of(9, 0)));
		assertFalse(range.contains(LocalTime.of(7, 59)));
		assertFalse(range.contains(LocalTime.of(12, 0)));
	}

	@Test
	void testTimeRangeCrossMidnight() {
		TimeRange range = new TimeRange("22:00", "06:00");
		assertTrue(range.contains(LocalTime.of(23, 0)));
		assertTrue(range.contains(LocalTime.of(1, 0)));
		assertFalse(range.contains(LocalTime.of(7, 0)));
	}

	@Test
	void testTimeBlockRetrievalHighWorkday() {
		LocalTime time = LocalTime.of(8, 0);
		TimeBlock block = builder.getBlockForTime(time, SeasonType.HIGH, DayType.WORKDAY);
		assertEquals(1, block.getBlockNumber());
	}

	@Test
	void testTimeBlockRetrievalLowWeekend() {
		LocalTime time = LocalTime.of(2, 0);
		TimeBlock block = builder.getBlockForTime(time, SeasonType.LOW, DayType.WEEKEND);
		assertEquals(5, block.getBlockNumber());
	}

	@Test
	void testGetCurrentTimeBlockDoesNotThrow() {
		assertDoesNotThrow(() -> timeBlockService.getCurrentTimeBlock());
	}
}
