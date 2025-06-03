package feri.um.si.omreznina.powerTest;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import feri.um.si.omreznina.controller.PowerController;
import feri.um.si.omreznina.model.Tariff;
import feri.um.si.omreznina.service.PowerService;

@WebMvcTest(PowerController.class)
@AutoConfigureMockMvc(addFilters = false)
@SuppressWarnings("removal")
public class PowerControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private PowerService powerService;

	@Test
	void shouldReturnTariff() throws Exception {
		Tariff tariff = new Tariff();
		when(powerService.getTariff("test-uid")).thenReturn(tariff);

		mockMvc.perform(get("/power/tariff")
				.param("uid", "test-uid")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").exists());
	}

	@Test
	void shouldReturnBadRequestOnTariffError() throws Exception {
		when(powerService.getTariff("test-uid")).thenThrow(new RuntimeException("Error"));

		mockMvc.perform(get("/power/tariff")
				.param("uid", "test-uid")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isBadRequest());
	}

	@Test
	void shouldReturnEnergyPrice() throws Exception {
		double consumption = 23.5;
		double expectedPrice = 4.17;
		when(powerService.getPricePerHour(consumption, "test-uid")).thenReturn(expectedPrice);

		mockMvc.perform(get("/power/energy-price")
				.param("consumption", String.valueOf(consumption))
				.param("uid", "test-uid")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string(String.valueOf(expectedPrice)));
	}

	@Test
	void shouldReturnBadRequestOnEnergyPriceError() throws Exception {
		double consumption = 42.0;
		when(powerService.getPricePerHour(consumption, "test-uid")).thenThrow(new RuntimeException("Error"));

		mockMvc.perform(get("/power/energy-price")
				.param("consumption", String.valueOf(consumption))
				.param("uid", "test-uid")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isBadRequest());
	}

	@Test
	void shouldRemoveEtFromDb_andReturnOk() throws Exception {
		doNothing().when(powerService).removeEtFromDb("testUid");

		mockMvc.perform(delete("/power/remove-et")
				.param("uid", "testUid"))
				.andExpect(status().isOk())
				.andExpect(content().string("Successfuly deleted ET"));

		verify(powerService).removeEtFromDb("testUid");
	}

	@Test
	void shouldReturnBadRequest_whenRemoveEtThrows() throws Exception {
		doThrow(new RuntimeException("fail")).when(powerService).removeEtFromDb("testUid");

		mockMvc.perform(delete("/power/remove-et")
				.param("uid", "testUid"))
				.andExpect(status().isBadRequest());
	}

}