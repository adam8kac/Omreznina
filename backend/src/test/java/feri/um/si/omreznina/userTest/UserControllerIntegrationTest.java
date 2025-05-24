package feri.um.si.omreznina.userTest;

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

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import feri.um.si.omreznina.OmrezninaApplication;
import feri.um.si.omreznina.config.FirebaseTestConfig;
import feri.um.si.omreznina.service.UserService;

@SpringBootTest(classes = { OmrezninaApplication.class, FirebaseTestConfig.class })
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("removal")
public class UserControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private UserService userService;

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

}
