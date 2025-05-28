package feri.um.si.omreznina.simulation;

import com.fasterxml.jackson.databind.ObjectMapper;
import feri.um.si.omreznina.controller.SimulationOfExpensesController;
import feri.um.si.omreznina.service.SimulationOfExpensesService;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.SimulationOfExpensesService.DayType;
import feri.um.si.omreznina.service.SimulationOfExpensesService.Season;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.util.*;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SimulationOfExpensesController.class)
@AutoConfigureMockMvc(addFilters = false)
public class SimulationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private SimulationOfExpensesService simulationService;

	@MockBean
	private FirestoreService firestoreService;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Test
	void testGetAvailableDevices_success() throws Exception {
		List<String> devices = List.of("TV", "Sušilni stroj");

		when(simulationService.getAvailableDevices()).thenReturn(devices);

		mockMvc.perform(get("/api/simulation/available-devices"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0]").value("TV"))
				.andExpect(jsonPath("$[1]").value("Sušilni stroj"));
	}

	@Test
	void testSimulate_success() throws Exception {
		Map<String, Object> result = Map.of(
				"status", "V REDU",
				"totalUsedPower", 1000,
				"agreedPower", 2000
		);

		List<String> devices = List.of("TV");
		Map<Integer, Integer> powers = Map.of(1, 2000);

		Map<String, Object> request = Map.of(
				"selectedDevices", devices,
				"agreedPowers", powers,
				"season", Season.VISJA,
				"dayType", DayType.DELOVNI_DAN
		);

		when(simulationService.simulate(devices, powers, Season.VISJA, DayType.DELOVNI_DAN))
				.thenReturn(result);

		mockMvc.perform(post("/api/simulation/simulate")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("V REDU"))
				.andExpect(jsonPath("$.totalUsedPower").value(1000));
	}

	@Test
	void testSetAgreedPowers_success() throws Exception {
		Map<Integer, Integer> powers = Map.of(1, 2000);
		Map<String, Object> request = Map.of(
				"uid", "user1",
				"agreedPowers", powers
		);

		mockMvc.perform(post("/api/simulation/setAgreedPowers")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(content().string("Saved agreed powers."));

		verify(simulationService).saveAgreedPowers("user1", powers);
	}

	@Test
	void testGetAgreedPowers_found() throws Exception {
		Map<Integer, Integer> powers = Map.of(1, 2000);

		when(firestoreService.getAgreedPowers("user1")).thenReturn(powers);

		mockMvc.perform(get("/api/simulation/getAgreedPowers")
						.param("uid", "user1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$['1']").value(2000));
	}

	@Test
	void testGetAgreedPowers_notFound() throws Exception {
		when(firestoreService.getAgreedPowers("user1")).thenReturn(null);

		mockMvc.perform(get("/api/simulation/getAgreedPowers")
						.param("uid", "user1"))
				.andExpect(status().isNotFound());
	}
}
