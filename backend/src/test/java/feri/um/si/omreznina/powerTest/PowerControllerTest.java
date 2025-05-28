package feri.um.si.omreznina.powerTest;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
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
        when(powerService.getTariff()).thenReturn(tariff);

        mockMvc.perform(get("/power/tariff")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").exists());
    }

    @Test
    void shouldReturnBadRequestOnTariffError() throws Exception {
        when(powerService.getTariff()).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/power/tariff")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

        @Test
    void shouldReturnEnergyPrice() throws Exception {
        double consumption = 23.5;
        double expectedPrice = 4.17;
        when(powerService.getPricePerHour(consumption)).thenReturn(expectedPrice);

        mockMvc.perform(get("/power/energy-price")
                .param("consumption", String.valueOf(consumption))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().string(String.valueOf(expectedPrice)));
    }

    @Test
    void shouldReturnBadRequestOnEnergyPriceError() throws Exception {
        double consumption = 42.0;
        when(powerService.getPricePerHour(consumption)).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/power/energy-price")
                .param("consumption", String.valueOf(consumption))
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest());
    }
}


