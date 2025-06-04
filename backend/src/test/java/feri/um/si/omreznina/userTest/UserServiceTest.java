package feri.um.si.omreznina.userTest;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.service.FileService;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.UserService;
import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;


@SuppressWarnings("removal")
@ActiveProfiles("test")
@SpringBootTest(properties = {"mfa.secret.encryption-key=nekTestKey123456", "spring.ai.openai.api-key=dummy_test_key"})
public class UserServiceTest {

	@MockBean
	private FileService fileService;

	@MockBean
	private FirestoreService firestoreService;

	@Test
	void success_verified_user() throws Exception {
		String uid = "verifiedUser";
		String jsonResponse = "{\"2023\": {\"2023-01\": {\"a\": 1}}}";

		MockMultipartFile file = new MockMultipartFile(
				"file", "test.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"irrelevant".getBytes());

		UserRecord mockRecord = mock(UserRecord.class);
		when(mockRecord.isEmailVerified()).thenReturn(true);

		try (MockedStatic<FirebaseAuth> mockedStatic = mockStatic(FirebaseAuth.class)) {
			FirebaseAuth firebaseAuthMock = mock(FirebaseAuth.class);
			when(firebaseAuthMock.getUser(uid)).thenReturn(mockRecord);
			mockedStatic.when(FirebaseAuth::getInstance).thenReturn(firebaseAuthMock);

			when(fileService.sendFileToParser(file)).thenReturn(jsonResponse);

			UserService userService = new UserService(fileService, firestoreService);
			userService.processAndStoreUserData(file, uid);

			verify(firestoreService, times(1)).saveDocumentToCollection(eq(uid), eq("poraba"), any());
		}
	}

	@Test
	void fail_not_verified_user() throws Exception {
		String uid = "notVerifiedUser";

		MockMultipartFile file = new MockMultipartFile(
				"file", "test.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"irrelevant".getBytes());

		UserRecord mockRecord = mock(UserRecord.class);
		when(mockRecord.isEmailVerified()).thenReturn(false);

		try (MockedStatic<FirebaseAuth> mockedStatic = mockStatic(FirebaseAuth.class)) {
			FirebaseAuth firebaseAuthMock = mock(FirebaseAuth.class);
			when(firebaseAuthMock.getUser(uid)).thenReturn(mockRecord);
			mockedStatic.when(FirebaseAuth::getInstance).thenReturn(firebaseAuthMock);

			UserService userService = new UserService(fileService, firestoreService);

			try {
				userService.processAndStoreUserData(file, uid);
				fail("Expected UserException was not thrown");
			} catch (UserException e) {
				assertTrue(e.getMessage().contains("does not have  verified email"));
			}
		}
	}

	 @Test
void testGetClientLocation_realDB() {
    HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
    Mockito.when(mockRequest.getRemoteAddr()).thenReturn("176.76.226.45");

    UserService userService = new UserService(null, null);
    Map<String, Double> result = userService.getClientLocation(mockRequest);

    assertNotNull(result, "Result should not be null!");
    assertEquals(46.0543, result.get("latitude"), 0.1);
    assertEquals(14.5044, result.get("longitude"), 0.1);
}


}
