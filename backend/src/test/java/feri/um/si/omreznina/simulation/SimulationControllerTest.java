package feri.um.si.omreznina.simulation;

import feri.um.si.omreznina.controller.SimulationOfExpensesController;
import feri.um.si.omreznina.service.SimulationOfExpensesService;
import feri.um.si.omreznina.service.FirestoreService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
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

	@Test
	void testGetAvailableDevices_success() throws Exception {
		List<String> devices = List.of("TV", "Sušilni stroj");

		when(simulationService.getAvailableDevices()).thenReturn(devices);

		mockMvc.perform(MockMvcRequestBuilders.get("/api/simulation/available-devices"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0]").value("TV"))
				.andExpect(jsonPath("$[1]").value("Sušilni stroj"));
	}
}
