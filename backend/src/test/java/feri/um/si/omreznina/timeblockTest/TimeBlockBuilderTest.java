package feri.um.si.omreznina.timeblockTest;

import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.resolver.TimeBlockBuilder;
import feri.um.si.omreznina.type.DayType;
import feri.um.si.omreznina.type.SeasonType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

public class TimeBlockBuilderTest {

	private TimeBlockBuilder builder;

	@BeforeEach
	public void setUp() {
		builder = new TimeBlockBuilder();
	}

	@Test
	public void shouldReturnMatchingTimeBlock() {
		LocalTime testTime = LocalTime.of(8, 0);

		TimeBlock block = builder.getBlockForTime(testTime, SeasonType.HIGH, DayType.WORKDAY);

		assertNotNull(block);
		assertEquals(SeasonType.HIGH, block.getSeasonType());
		assertEquals(DayType.WORKDAY, block.getDayType());
		assertEquals(1, block.getBlockNumber());
	}

	@Test
	public void shouldThrowWhenNoBlockMatches() {
		TimeBlockBuilder builder = new TimeBlockBuilder();
		builder.getBlocks().clear();

		assertThrows(IllegalStateException.class, () -> {
			builder.getBlockForTime(LocalTime.of(12, 0), SeasonType.HIGH, DayType.WORKDAY);
		});
	}

}
