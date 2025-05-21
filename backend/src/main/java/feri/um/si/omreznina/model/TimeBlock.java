package feri.um.si.omreznina.model;

import java.util.List;

import feri.um.si.omreznina.type.DayType;
import feri.um.si.omreznina.type.SeasonType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimeBlock {
	private SeasonType seasonType;
	private DayType dayType;
	private int blockNumber;
	private List<TimeRange> timeRanges;
	private double price;

	public TimeBlock(SeasonType seasonType, DayType dayType, int blockNumber, List<TimeRange> timeRanges) {
		this.seasonType = seasonType;
		this.dayType = dayType;
		this.blockNumber = blockNumber;
		this.timeRanges = timeRanges;
		this.price = setPrice(blockNumber);
	}

	private double setPrice(int block) {
		if (block == 1) {
			return 3.42250;
		} else if (block == 2) {
			return 0.91224;
		} else if (block == 3) {
			return 0.16297;
		} else if (block == 4) {
			return 0.00407;
		} else {
			return 0.00;
		}
	}
}
