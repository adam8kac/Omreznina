package feri.um.si.omreznina.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
				break;
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
		return blockList.getBlockForTime(currentTime, currentMonth, currentDay);
	}

	public TimeBlock getCustomTimeBlock(String dateTimeString) {
		int[] winterMonths = { 1, 2, 11, 12 };
		DayOfWeek[] weekends = { DayOfWeek.SATURDAY, DayOfWeek.SUNDAY };
		String dateString = dateTimeString.split(" ")[0];
		LocalTime time = LocalTime.parse(dateTimeString.split(" ")[1]);
		LocalDate date = LocalDate.parse(dateString);
		int dateMonth = date.getMonthValue();
		SeasonType currentMonth = null;
		DayType currentDay = null;

		for (int wMonth : winterMonths) {
			if (dateMonth == wMonth) {
				currentMonth = SeasonType.HIGH;
				break;
			} else {
				currentMonth = SeasonType.LOW;
			}
		}

		for (DayOfWeek day : weekends) {
			if ((date.getDayOfWeek().equals(day)) || holidayChecker.isHoliday(date)) {
				currentDay = DayType.WEEKEND;
				break;
			} else {
				currentDay = DayType.WORKDAY;
			}
		}
		return blockList.getBlockForTime(time, currentMonth, currentDay);
	}

	public Map<String, Object> getNumberAndPrice(String dateTimeString) {
		if (dateTimeString == null || !dateTimeString.matches("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}")) {
			throw new IllegalArgumentException("Invalid dateTimeString format. Required: yyyy-MM-dd HH:mm");
		}

		TimeBlock block = getCustomTimeBlock(dateTimeString);
		Map<String, Object> result = new HashMap<>();
		result.put("blockNumber", block.getBlockNumber());
		result.put("price", block.getPrice());
		return result;
	}

}
