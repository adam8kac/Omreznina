package feri.um.si.omreznina.userTest;

import feri.um.si.omreznina.OmrezninaApplication;
import feri.um.si.omreznina.config.FirebaseTestConfig;
import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.service.UserService;
import feri.um.si.omreznina.service.WeatherService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = {OmrezninaApplication.class, FirebaseTestConfig.class},
		properties = {
				"mfa.secret.encryption-key=nekTestKey123456",
				"spring.ai.openai.api-key=dummy_test_key",
				"openweather.api.key=ffdfdsbfjdjfbdjsfbdsbfbdsjb"
		})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("removal")
@Tag("integration")
public class UserControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private UserService userService;

	@MockBean
	private WeatherService weatherService;

	@Test
	void uploadFile_success() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "data.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "file".getBytes());
		mockMvc.perform(multipart("/user/upload-file").file(file).param("uid", "abc"))
				.andExpect(status().isOk())
				.andExpect(content().string("Document added successfuly"));
		verify(userService).processAndStoreUserData(file, "abc");
	}

	@Test
	void uploadFile_fail() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "data.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "file".getBytes());
		doThrow(new RuntimeException("fail")).when(userService).processAndStoreUserData(file, "abc");
		mockMvc.perform(multipart("/user/upload-file").file(file).param("uid", "abc"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Could not save document"));
	}

	@Test
	void uploadPowerConsumption_success() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "file.csv", "text/csv", "data".getBytes());
		doNothing().when(userService).processAndStoreMaxPowerConsumption(any(), eq("{\"01\":10}"), eq("u1"));
		mockMvc.perform(multipart("/user/upload-power-consumption")
						.file(file)
						.param("power_by_months", "{\"01\":10}")
						.param("uid", "u1")
						.contentType(MediaType.MULTIPART_FORM_DATA))
				.andExpect(status().isOk())
				.andExpect(content().string("Document added successfuly"));
	}

	@Test
	void uploadPowerConsumption_fail() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "file.csv", "text/csv", "data".getBytes());
		doThrow(new RuntimeException("fail")).when(userService)
				.processAndStoreMaxPowerConsumption(any(), any(), any());
		mockMvc.perform(multipart("/user/upload-power-consumption")
						.file(file)
						.param("power_by_months", "{}")
						.param("uid", "u1")
						.contentType(MediaType.MULTIPART_FORM_DATA))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Could not save document"));
	}

	@Test
	void uploadAndOptimize_success() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "d.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xxx".getBytes());
		doNothing().when(userService).computeAndStoreOptimalPower(any(), any(), any());
		mockMvc.perform(multipart("/user/optimal-power")
						.file(file)
						.param("power_by_months", "{\"01\":9}")
						.param("uid", "u2"))
				.andExpect(status().isOk())
				.andExpect(content().string("Document added successfuly"));
	}

	@Test
	void uploadAndOptimize_fail() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "d.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xxx".getBytes());
		doThrow(new RuntimeException()).when(userService).computeAndStoreOptimalPower(any(), any(), any());
		mockMvc.perform(multipart("/user/optimal-power")
						.file(file)
						.param("power_by_months", "{}")
						.param("uid", "u2"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void getLocation_success() throws Exception {
		Map<String, Double> loc = Map.of("latitude", 1.1, "longitude", 2.2);
		when(userService.getClientLocation(any())).thenReturn(loc);
		mockMvc.perform(get("/user/location")).andExpect(status().isOk());
	}

	@Test
	void getCurrentTemperature_success() throws Exception {
		Map<String, Double> loc = Map.of("latitude", 46.05, "longitude", 14.5);
		when(userService.getClientLocation(any())).thenReturn(loc);
		when(weatherService.getWeatherInfo(46.05, 14.5)).thenReturn("{\"main\":{\"temp\":21}}");
		mockMvc.perform(get("/user/current-temparature"))
				.andExpect(status().isOk())
				.andExpect(content().string("{\"main\":{\"temp\":21}}"));
	}

	@Test
	void getDataForLLM_success() throws Exception {
		Map<String, Object> data = new HashMap<>(); data.put("k", "v");
		when(userService.getUserDataForML(eq("1234567890123456789012345678"), any())).thenReturn(data);
		mockMvc.perform(get("/user/llm-data").param("uid", "1234567890123456789012345678"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.k").value("v"));
	}

	@Test
	void getDataForLLM_invalidUID() throws Exception {
		mockMvc.perform(get("/user/llm-data").param("uid", "baduid"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void getDataForLLM_userException() throws Exception {
		when(userService.getUserDataForML(eq("gooduid_gooduid_gooduid1234"), any()))
				.thenThrow(new UserException("fail"));
		mockMvc.perform(get("/user/llm-data").param("uid", "gooduid_gooduid_gooduid1234"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void predictMonthlyOverrun_successPythonError() throws Exception {
		Map<String, Object> req = Map.of("uid", "abc", "year", "2025", "month", "06");
		Map<String, Double> loc = Map.of("latitude", 10.0, "longitude", 20.0);
		Map<String, Object> dummyMonth = Map.of("foo", "bar");
		Map<String, Object> year2024 = Map.of("06", dummyMonth);
		Map<String, Object> prekoracitve = Map.of("2024", year2024);
		Map<String, Object> userDataForML = Map.of("prekoracitve", prekoracitve);

		when(userService.getClientLocation(any())).thenReturn(loc);
		when(userService.getUserDataForML(eq("abc"), any())).thenReturn(userDataForML);

		mockMvc.perform(post("/user/prediction/monthly-overrun")
						.contentType(MediaType.APPLICATION_JSON)
						.content(new ObjectMapper().writeValueAsString(req)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Napaka pri pripravi podatkov za napoved."));
	}

	@Test
	void predictMonthlyOverrun_noPrekoracitve() throws Exception {
		Map<String, Object> req = Map.of("uid", "abc", "year", "2025", "month", "06");
		Map<String, Object> userDataForML = new HashMap<>();
		userDataForML.put("prekoracitve", null);
		when(userService.getUserDataForML(eq("abc"), any())).thenReturn(userDataForML);

		mockMvc.perform(post("/user/prediction/monthly-overrun")
						.contentType(MediaType.APPLICATION_JSON)
						.content(new ObjectMapper().writeValueAsString(req)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Ni podatkov o prekorčitvah."));
	}

	@Test
	void predictMonthlyOverrun_noDataForYear() throws Exception {
		Map<String, Object> req = Map.of("uid", "abc", "year", "2025", "month", "06");
		Map<String, Object> userDataForML = Map.of("prekoracitve", Map.of());
		when(userService.getUserDataForML(eq("abc"), any())).thenReturn(userDataForML);

		mockMvc.perform(post("/user/prediction/monthly-overrun")
						.contentType(MediaType.APPLICATION_JSON)
						.content(new ObjectMapper().writeValueAsString(req)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Ni podatkov o prekorčitvah."));
	}

	@Test
	void predictMonthlyOverrun_noDataForMonth() throws Exception {
		Map<String, Object> req = Map.of("uid", "abc", "year", "2025", "month", "06");
		Map<String, Object> year2024 = Map.of();
		Map<String, Object> prekoracitve = Map.of("2024", year2024);
		Map<String, Object> userDataForML = Map.of("prekoracitve", prekoracitve);
		when(userService.getUserDataForML(eq("abc"), any())).thenReturn(userDataForML);

		mockMvc.perform(post("/user/prediction/monthly-overrun")
						.contentType(MediaType.APPLICATION_JSON)
						.content(new ObjectMapper().writeValueAsString(req)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Ni podatkov za izbran mesec (2024-06)!"));
	}
}