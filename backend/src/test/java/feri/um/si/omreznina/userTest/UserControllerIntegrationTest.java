package feri.um.si.omreznina.userTest;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

import feri.um.si.omreznina.OmrezninaApplication;
import feri.um.si.omreznina.config.FirebaseTestConfig;
import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.service.UserService;
import feri.um.si.omreznina.service.WeatherService;

@SpringBootTest(classes = { OmrezninaApplication.class,
		FirebaseTestConfig.class }, properties = {
				"mfa.secret.encryption-key=nekTestKey123456",
				"spring.ai.openai.api-key=dummy_test_key", "openweather.api.key=ffdfdsbfjdjfbdjsfbdsbfbdsjb" })
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
	void testUploadFile_success() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file", "data.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "some".getBytes());

		mockMvc.perform(multipart("/user/upload-file")
				.file(file)
				.param("uid", "abc123"))
				.andExpect(status().isOk())
				.andExpect(content().string("Document added successfuly"));

		verify(userService, times(1)).processAndStoreUserData(file, "abc123");
	}

	@Test
	void testUploadFile_failure() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file", "data.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "some".getBytes());

		doThrow(new RuntimeException("Something went wrong"))
				.when(userService).processAndStoreUserData(file, "abc123");

		mockMvc.perform(multipart("/user/upload-file")
				.file(file)
				.param("uid", "abc123"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Could not save document"));
	}

	public void shouldUploadPowerConsumptionSuccessfully() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", "data".getBytes());
		String data = "dfhvsdhgvf";

		Mockito.doNothing().when(userService).processAndStoreMaxPowerConsumption(Mockito.any(), data,
				Mockito.eq("test-uid"));

		mockMvc.perform(multipart("/user/upload-power-consumption")
				.file(file)
				.param("uid", "test-uid")
				.contentType(MediaType.MULTIPART_FORM_DATA))
				.andExpect(status().isOk());
	}

	@Test
	public void shouldReturnBadRequestWhenExceptionThrown() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", "data".getBytes());

		Mockito.doThrow(new RuntimeException("fail")).when(userService)
				.processAndStoreMaxPowerConsumption(Mockito.any(), Mockito.anyString(), Mockito.eq("test-uid"));

		mockMvc.perform(multipart("/user/upload-power-consumption")
				.file(file)
				.param("uid", "test-uid")
				.contentType(MediaType.MULTIPART_FORM_DATA))
				.andExpect(status().isBadRequest());
	}

	@Test
	void testUploadAndOptimize_success() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file", "data.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "some".getBytes());

		String powerByMonths = "{\"01\":7.0,\"02\":6.0}";
		String uid = "abc123";

		doNothing().when(userService).computeAndStoreOptimalPower(file, powerByMonths, uid);

		mockMvc.perform(multipart("/user/optimal-power")
				.file(file)
				.param("power_by_months", powerByMonths)
				.param("uid", uid)
				.contentType(MediaType.MULTIPART_FORM_DATA))
				.andExpect(status().isOk())
				.andExpect(content().string("Document added successfuly"));

		verify(userService, times(1)).computeAndStoreOptimalPower(file, powerByMonths, uid);
	}

	@Test
	void testUploadAndOptimize_failure() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file", "data.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "some".getBytes());

		String powerByMonths = "{\"01\":7.0,\"02\":6.0}";
		String uid = "abc123";

		doThrow(new RuntimeException("Error")).when(userService)
				.computeAndStoreOptimalPower(file, powerByMonths, uid);

		mockMvc.perform(multipart("/user/optimal-power")
				.file(file)
				.param("power_by_months", powerByMonths)
				.param("uid", uid)
				.contentType(MediaType.MULTIPART_FORM_DATA))
				.andExpect(status().isBadRequest());
	}

	@Test
	void getCurrentTemperature_returnsWeather() throws Exception {
		Map<String, Double> location = new HashMap<>();
		location.put("latitude", 46.05);
		location.put("longitude", 14.50);

		Mockito.when(userService.getClientLocation(any())).thenReturn(location);
		Mockito.when(weatherService.getWeatherInfo(eq(46.05), eq(14.50)))
				.thenReturn("{\"main\":{\"temp\":25.5}}");

		mockMvc.perform(get("/user/current-temparature"))
				.andExpect(status().isOk())
				.andExpect(content().string("{\"main\":{\"temp\":25.5}}"));
	}

	@Test
	void getDataForLLM_returnsData() throws Exception {
		Map<String, Object> mlData = new HashMap<>();
		mlData.put("something", "value");

		String validUid = "1234567890123456789012345678";

		Mockito.when(userService.getUserDataForML(eq(validUid), any())).thenReturn(mlData);

		mockMvc.perform(get("/user/llm-data")
				.param("uid", validUid))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.something").value("value"));
	}

	@Test
	void getDataForLLM_returnsBadRequestOnException() throws Exception {
		Mockito.when(userService.getUserDataForML(eq("baduid"), any()))
				.thenThrow(new UserException("Some error"));

		mockMvc.perform(get("/user/llm-data")
				.param("uid", "baduid"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void testPredictMonthlyOverrun_success() throws Exception {
		Map<String, Object> req = new HashMap<>();
		req.put("uid", "abc123");
		req.put("year", "2025");
		req.put("month", "06");

		// Dummy location
		Map<String, Double> dummyLocation = new HashMap<>();
		dummyLocation.put("latitude", 46.06);
		dummyLocation.put("longitude", 14.51);

		// Dummy month data
		Map<String, Object> dummyMonth = new HashMap<>();
		dummyMonth.put("data", "testdata");

		// Structure: prekoracitve -> leto -> mesec -> podatki
		Map<String, Object> year2024 = new HashMap<>();
		year2024.put("06", dummyMonth);
		Map<String, Object> prekoracitve = new HashMap<>();
		prekoracitve.put("2024", year2024);

		Map<String, Object> userDataForML = new HashMap<>();
		userDataForML.put("prekoracitve", prekoracitve);

		when(userService.getClientLocation(any())).thenReturn(dummyLocation);
		when(userService.getUserDataForML(eq("abc123"), any())).thenReturn(userDataForML);

		// Python endpoint ni gor: pričakujemo napako
		mockMvc.perform(post("/user/prediction/monthly-overrun")
						.contentType(MediaType.APPLICATION_JSON)
						.content(new ObjectMapper().writeValueAsString(req)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Napaka pri pripravi podatkov za napoved."));
	}

	@Test
	void testPredictMonthlyOverrun_noPrekoracitve() throws Exception {
		Map<String, Object> req = new HashMap<>();
		req.put("uid", "abc123");
		req.put("year", "2025");
		req.put("month", "06");

		Map<String, Object> userDataForML = new HashMap<>();
		userDataForML.put("prekoracitve", null);

		when(userService.getUserDataForML(eq("abc123"), any())).thenReturn(userDataForML);

		mockMvc.perform(post("/user/prediction/monthly-overrun")
						.contentType(MediaType.APPLICATION_JSON)
						.content(new ObjectMapper().writeValueAsString(req)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Ni podatkov o prekoracitvah."));
	}

	@Test
	void testPredictMonthlyOverrun_noDataForMonth() throws Exception {
		Map<String, Object> req = new HashMap<>();
		req.put("uid", "abc123");
		req.put("year", "2025");
		req.put("month", "06");

		// year 2024 je prisoten, meseca "06" NI!
		Map<String, Object> year2024 = new HashMap<>();
		// year2024.put("06", dummyMonth); // month je missing!
		Map<String, Object> prekoracitve = new HashMap<>();
		prekoracitve.put("2024", year2024);

		Map<String, Object> userDataForML = new HashMap<>();
		userDataForML.put("prekoracitve", prekoracitve);

		when(userService.getUserDataForML(eq("abc123"), any())).thenReturn(userDataForML);

		mockMvc.perform(post("/user/prediction/monthly-overrun")
						.contentType(MediaType.APPLICATION_JSON)
						.content(new ObjectMapper().writeValueAsString(req)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Ni podatkov za izbran mesec (2024-06)!"));
	}
}
