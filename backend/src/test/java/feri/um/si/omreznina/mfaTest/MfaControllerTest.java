package feri.um.si.omreznina.mfaTest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import feri.um.si.omreznina.controller.MfaController;
import feri.um.si.omreznina.model.MfaSettings;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.MfaService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@WebMvcTest(MfaController.class)
@SuppressWarnings("removal")
@AutoConfigureMockMvc(addFilters = false)
public class MfaControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private MfaService mfaService;

	@MockBean
	private FirestoreService firestoreService;

	@Test
	void testSetupMfa_success() throws Exception {
		String json = "{\"uid\":\"user1\",\"secret\":\"s3cr3t\",\"enabled\":true}";
		mockMvc.perform(post("/firestore/mfa/setup")
				.contentType("application/json")
				.content(json))
				.andExpect(status().isOk())
				.andExpect(content().string(org.hamcrest.Matchers.containsString("MFA nastavitve")));
		
		verify(mfaService).saveSettings("user1", "s3cr3t", true);
	}

	@Test
	void testSetupMfa_failure() throws Exception {
		doThrow(new RuntimeException("BOOM")).when(mfaService).saveSettings(anyString(), anyString(), anyBoolean());
		String json = "{\"uid\":\"user1\",\"secret\":\"s3cr3t\",\"enabled\":true}";
		mockMvc.perform(post("/firestore/mfa/setup")
				.contentType("application/json")
				.content(json))
				.andExpect(status().isInternalServerError())
				.andExpect(content().string(org.hamcrest.Matchers.containsString("Napaka: BOOM")));
		verify(mfaService).saveSettings("user1", "s3cr3t", true);
	}

	@Test
	void testGetSettings_success() throws Exception {
		MfaSettings settings = new MfaSettings("user1", true, "encrypted-secret");
		when(firestoreService.getMfaSettings("user1")).thenReturn(settings);

		mockMvc.perform(get("/firestore/mfa/user1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.uid").value("user1"))
				.andExpect(jsonPath("$.enabled").value(true))
				.andExpect(jsonPath("$.secretHash").value("encrypted-secret"));
	}

	@Test
	void testGetSettings_notFound() throws Exception {
		when(firestoreService.getMfaSettings("user1")).thenReturn(null);

		mockMvc.perform(get("/firestore/mfa/user1"))
				.andExpect(status().isNotFound());
	}

	@Test
	void testVerifyCode_true() throws Exception {
		when(mfaService.verifyTotpCode(eq("user1"), eq("123456"))).thenReturn(true);
		String json = "{\"uid\":\"user1\",\"code\":\"123456\"}";
		mockMvc.perform(post("/firestore/mfa/verify")
				.contentType("application/json")
				.content(json))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));
	}

	@Test
	void testVerifyCode_false() throws Exception {
		when(mfaService.verifyTotpCode(eq("user1"), eq("654321"))).thenReturn(false);
		String json = "{\"uid\":\"user1\",\"code\":\"654321\"}";
		mockMvc.perform(post("/firestore/mfa/verify")
				.contentType("application/json")
				.content(json))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));
	}
}
