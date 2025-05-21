package feri.um.si.omreznina.model;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TimeRange {
	private LocalTime from;
	private LocalTime to;

	public TimeRange(String fromStr, String toStr) {
		this.from = LocalTime.parse(fromStr);
		this.to = LocalTime.parse(toStr);
	}

	// ce bo cez polnoc
	public boolean contains(LocalTime time) {
		if (from.isBefore(to)) {
			return !time.isBefore(from) && time.isBefore(to);
		} else {
			return !time.isBefore(from) || time.isBefore(to);
		}
	}
}
