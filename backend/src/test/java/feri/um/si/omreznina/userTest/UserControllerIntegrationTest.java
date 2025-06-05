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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

		Mockito.when(userService.getUserDataForML(eq("testuid"), any())).thenReturn(mlData);

		mockMvc.perform(get("/user/llm-data")
				.param("uid", "testuid"))
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
}
