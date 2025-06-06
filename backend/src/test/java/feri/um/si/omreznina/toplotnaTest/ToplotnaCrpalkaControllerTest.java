package feri.um.si.omreznina.toplotnaTest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import feri.um.si.omreznina.controller.ToplotnaCrpalkaController;
import feri.um.si.omreznina.service.ToplotnaCrpalkaService;

@SuppressWarnings("removal")
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ToplotnaCrpalkaController.class)
class ToplotnaCrpalkaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ToplotnaCrpalkaService toplotnaCrpalkaService;

    @Test
    void getToplotnaPower_shouldReturnPower() throws Exception {
        String uid = "test123";
        double expectedPower = 4.2;
        when(toplotnaCrpalkaService.getCurrentWorkingPower(any(HttpServletRequest.class), eq(uid)))
                .thenReturn(expectedPower);

        mockMvc.perform(get("/toplotna/get-current-working-power")
                        .param("uid", uid))
                .andExpect(status().isOk())
                .andExpect(content().string("4.2"));
    }

    @Test
    void getToplotnaPower_shouldReturnBadRequest_onException() throws Exception {
        String uid = "test123";
        when(toplotnaCrpalkaService.getCurrentWorkingPower(any(HttpServletRequest.class), eq(uid)))
                .thenThrow(new RuntimeException("Simulated error"));

        mockMvc.perform(get("/toplotna/get-current-working-power")
                        .param("uid", uid))
                .andExpect(status().isBadRequest());
    }
}
