package feri.um.si.omreznina.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.stereotype.Service;

import feri.um.si.omreznina.helper.HolidayChecker;
import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.resolver.TimeBlockBuilder;
import feri.um.si.omreznina.type.DayType;
import feri.um.si.omreznina.type.SeasonType;

@Service
public class TimeBlockService {
	private TimeBlockBuilder blockList;

	private final HolidayChecker holidayChecker;
	private Logger logger = Logger.getLogger(getClass().getName());

	public TimeBlockService(TimeBlockBuilder blockList, HolidayChecker holidayChecker) {
		this.holidayChecker = holidayChecker;
		this.blockList = blockList;
	}

	public List<TimeBlock> getAllBlocks() {
		return blockList.getBlocks();
	}

	public TimeBlock getCurrentTimeBlock() {
		int[] winterMonths = { 1, 2, 11, 12 };
		DayOfWeek[] weekends = { DayOfWeek.SATURDAY, DayOfWeek.SUNDAY };
		LocalTime currentTime = LocalTime.now();
		SeasonType currentMonth = null;
		DayType currentDay = null;

		for (int wMonth : winterMonths) {
			if (LocalDate.now().getMonthValue() == wMonth) {
				currentMonth = SeasonType.HIGH;
			} else {
				currentMonth = SeasonType.LOW;
			}
		}

		for (DayOfWeek day : weekends) {
			if ((LocalDate.now().getDayOfWeek().equals(day)) || holidayChecker.isHoliday(LocalDate.now())) {
				currentDay = DayType.WEEKEND;
				break;
			} else {
				currentDay = DayType.WORKDAY;
			}
		}
		logger.log(Level.INFO, "today is: " + currentTime + "month: " + currentMonth + "current day: " + currentDay);
		return blockList.getBlockForTime(currentTime, currentMonth, currentDay);

	}

}
