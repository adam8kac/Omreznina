package feri.um.si.omreznina.simulation;

import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.SimulationOfExpensesService;
import feri.um.si.omreznina.service.TimeBlockService;
import feri.um.si.omreznina.service.SimulationOfExpensesService.DayType;
import feri.um.si.omreznina.service.SimulationOfExpensesService.Season;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SimulationServiceTest {

	private SimulationOfExpensesService simulationService;
	private TimeBlockService timeBlockService;
	private FirestoreService firestoreService;

	@BeforeEach
	void setUp() {
		timeBlockService = mock(TimeBlockService.class);
		firestoreService = mock(FirestoreService.class);

		TimeBlock fakeBlock = new TimeBlock();
		fakeBlock.setBlockNumber(1);
		when(timeBlockService.getCurrentTimeBlock()).thenReturn(fakeBlock);

		simulationService = new SimulationOfExpensesService(timeBlockService, firestoreService);
	}

	@Test
	void testGetAvailableDevices_returnsNonEmptyList() {
		List<String> devices = simulationService.getAvailableDevices();
		assertNotNull(devices);
		assertFalse(devices.isEmpty());
		assertTrue(devices.contains("TV"));
		assertTrue(devices.contains("Sušilni stroj"));
	}

	@Test
	void testSimulate_noOveruse() {
		List<String> selectedDevices = List.of("TV", "Računalnik");
		Map<Integer, Integer> agreedPowers = Map.of(1, 3000);

		Map<String, Object> result = simulationService.simulate(
				selectedDevices, agreedPowers, Season.VISJA, DayType.DELOVNI_DAN
		);

		assertEquals("V REDU", result.get("status"));
		assertTrue((int) result.get("totalUsedPower") <= (int) result.get("agreedPower"));
	}

	@Test
	void testSimulate_withOveruse() {
		List<String> selectedDevices = List.of("Sušilni stroj", "Bojler");
		Map<Integer, Integer> agreedPowers = Map.of(1, 5000);

		Map<String, Object> result = simulationService.simulate(
				selectedDevices, agreedPowers, Season.NIZJA, DayType.DELA_PROST_DAN
		);

		assertEquals("PREKORAČITEV", result.get("status"));
		assertTrue((int) result.get("totalUsedPower") > (int) result.get("agreedPower"));
	}

	@Test
	void testSimulate_withExceptionalDevice() {
		List<String> selectedDevices = List.of("Toplotna črpalka", "TV");
		Map<Integer, Integer> agreedPowers = Map.of(1, 1000);

		Map<String, Object> result = simulationService.simulate(
				selectedDevices, agreedPowers, Season.VISJA, DayType.DELOVNI_DAN
		);

		assertTrue(((List<?>) result.get("exceptionalDevices")).contains("Toplotna črpalka (2000W)"));
	}
}
