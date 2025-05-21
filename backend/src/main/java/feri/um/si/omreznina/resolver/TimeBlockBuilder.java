package feri.um.si.omreznina.resolver;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.model.TimeRange;
import feri.um.si.omreznina.type.DayType;
import feri.um.si.omreznina.type.SeasonType;
import lombok.Data;

@Data
@Component
public class TimeBlockBuilder {
	private final List<TimeBlock> blocks;

	private final List<TimeRange> firstTimeRange = List.of(
			new TimeRange("07:00", "14:00"),
			new TimeRange("16:00", "20:00"));

	private final List<TimeRange> secondTimeRange = List.of(
			new TimeRange("06:00", "07:00"),
			new TimeRange("14:00", "16:00"),
			new TimeRange("20:00", "22:00"));

	private final List<TimeRange> thirdTimeRange = List.of(
			new TimeRange("00:00", "06:00"),
			new TimeRange("22:00", "20:00"));

	public TimeBlockBuilder() {
		blocks = new ArrayList<>();

		// Visoka sezona delovn dan
		TimeBlock highWork1 = new TimeBlock(SeasonType.HIGH, DayType.WORKDAY, 1, firstTimeRange);
		blocks.add(highWork1);

		TimeBlock highWork2 = new TimeBlock(SeasonType.HIGH, DayType.WORKDAY, 2, secondTimeRange);
		blocks.add(highWork2);

		TimeBlock highWork3 = new TimeBlock(SeasonType.HIGH, DayType.WORKDAY, 3, thirdTimeRange);
		blocks.add(highWork3);

		// Visoka sezona vikend
		TimeBlock highWeekend2 = new TimeBlock(SeasonType.HIGH, DayType.WEEKEND, 2, firstTimeRange);
		blocks.add(highWeekend2);

		TimeBlock highWeekend3 = new TimeBlock(SeasonType.HIGH, DayType.WEEKEND, 3, secondTimeRange);
		blocks.add(highWeekend3);

		TimeBlock highWeekend4 = new TimeBlock(SeasonType.HIGH, DayType.WEEKEND, 3, thirdTimeRange);
		blocks.add(highWeekend4);

		// Nizka sezna delovn dan
		TimeBlock lowWork2 = new TimeBlock(SeasonType.LOW, DayType.WORKDAY, 2, firstTimeRange);
		blocks.add(lowWork2);

		TimeBlock lowWork3 = new TimeBlock(SeasonType.LOW, DayType.WORKDAY, 3, secondTimeRange);
		blocks.add(lowWork3);

		TimeBlock lowWork4 = new TimeBlock(SeasonType.LOW, DayType.WORKDAY, 4, thirdTimeRange);
		blocks.add(lowWork4);

		// Nizka sezona vikend
		TimeBlock lowWeekend3 = new TimeBlock(SeasonType.LOW, DayType.WEEKEND, 3, firstTimeRange);
		blocks.add(lowWeekend3);

		TimeBlock lowWeekend4 = new TimeBlock(SeasonType.LOW, DayType.WEEKEND, 4, secondTimeRange);
		blocks.add(lowWeekend4);

		TimeBlock lowWeekend5 = new TimeBlock(SeasonType.LOW, DayType.WEEKEND, 5, thirdTimeRange);
		blocks.add(lowWeekend5);
	}

	public TimeBlock getBlockForTime(LocalTime time, SeasonType season, DayType dayType) {
		for (TimeBlock block : blocks) {
			if (block.getSeasonType() == season && block.getDayType() == dayType) {
				for (TimeRange range : block.getTimeRanges()) {
					if (range.contains(time)) {
						return block;
					}
				}
			}
		}
		throw new IllegalStateException(
				"No matching time block found for time: " + time + ", season: " + season + ", day: " + dayType);
	}
}
