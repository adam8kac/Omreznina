package feri.um.si.omreznina.simulation;
import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.service.SimulationOfExpensesService;
import feri.um.si.omreznina.service.SimulationOfExpensesService.DayType;
import feri.um.si.omreznina.service.SimulationOfExpensesService.Season;
import feri.um.si.omreznina.service.TimeBlockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SimulationServiceTest {

	private SimulationOfExpensesService simulationService;


	@BeforeEach
	void setUp() {
		TimeBlockService mockTimeBlockService = mock(TimeBlockService.class);
		TimeBlock fakeBlock = new TimeBlock();
		fakeBlock.setBlockNumber(1);
		when(mockTimeBlockService.getCurrentTimeBlock()).thenReturn(fakeBlock);
		simulationService = new SimulationOfExpensesService(mockTimeBlockService);
	}

	@Test
	void testGetAvailableDevices() {
		List<String> devices = simulationService.getAvailableDevices();

		assertTrue(devices.contains("TV"));
		assertTrue(devices.contains("Sušilni stroj"));
		assertFalse(devices.isEmpty());
	}

	@Test
	void testSimulate_noOveruse() {
		List<String> selectedDevices = List.of("TV", "Računalnik");

		Map<Integer, Integer> agreedPowers = Map.of(
				1, 3000,
				2, 3000,
				3, 3000,
				4, 3000
		);

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
				selectedDevices, agreedPowers, Season.VISJA, DayType.DELOVNI_DAN);

		assertEquals("PREKORAČITEV", result.get("status")); 
		assertTrue((int) result.get("totalUsedPower") > (int) result.get("agreedPower")); 
	}

}
