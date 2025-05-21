package feri.um.si.omreznina.simulation;
import feri.um.si.omreznina.service.SimulationOfExpensesService;
import feri.um.si.omreznina.service.SimulationOfExpensesService.DayType;
import feri.um.si.omreznina.service.SimulationOfExpensesService.Season;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class SimulationServiceTest {

    private SimulationOfExpensesService simulationService;

    @BeforeEach
    void setUp() {
        simulationService = new SimulationOfExpensesService();
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
                selectedDevices, agreedPowers, Season.VISJA, DayType.DELOVNI_DAN);

        assertEquals("PREKORAČITEV", result.get("status"));
        assertTrue((int) result.get("totalUsedPower") <= (int) result.get("agreedPower"));
    }


    @Test
    void testSimulate_withOveruse() {
        List<String> selectedDevices = List.of("Sušilni stroj", "Bojler");
        Map<Integer, Integer> agreedPowers = Map.of(1, 5000);

        Map<String, Object> result = simulationService.simulate(
                selectedDevices, agreedPowers, Season.VISJA, DayType.DELOVNI_DAN);

        assertEquals("PREKORAČITEV", result.get("status"));
        assertFalse((int) result.get("totalUsedPower") > (int) result.get("agreedPower"));
    }
}
