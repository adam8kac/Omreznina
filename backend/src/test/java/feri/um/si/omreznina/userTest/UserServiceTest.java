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
import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings({ "removal", "unchecked" })
@SpringBootTest(classes = { UserService.class, FileService.class, FirestoreService.class }, properties = {
		"mfa.secret.encryption-key=nekTestKey123456",
		"spring.ai.openai.api-key=dummy_test_key" })
@ActiveProfiles("test")
public class UserServiceTest {

	@MockBean
	private FileService fileService;

	@MockBean
	private FirestoreService firestoreService;

	@MockBean
	private UserService userService;

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
	void testGetClientLocation_realDB() throws Exception {
		HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
		Mockito.when(mockRequest.getRemoteAddr()).thenReturn("176.76.226.45");

		CityResponse mockCityResponse = Mockito.mock(CityResponse.class);
		com.maxmind.geoip2.record.Location mockLocation = Mockito.mock(com.maxmind.geoip2.record.Location.class);

		Mockito.when(mockLocation.getLatitude()).thenReturn(46.0543);
		Mockito.when(mockLocation.getLongitude()).thenReturn(14.5044);
		Mockito.when(mockCityResponse.getLocation()).thenReturn(mockLocation);

		DatabaseReader mockDbReader = Mockito.mock(DatabaseReader.class);
		Mockito.when(mockDbReader.city(any())).thenReturn(mockCityResponse);

		UserService userService = new UserService(null, null);
		Map<String, Double> result = userService.getClientLocation(mockRequest);

		assertNotNull(result, "Result should not be null!");
		assertEquals(46.0543, result.get("latitude"), 0.1);
		assertEquals(14.5044, result.get("longitude"), 0.1);
	}

	@Test
	void testGetUserDataForML_allDataPresent() throws Exception {
		String uid = "user123";
		HttpServletRequest request = mock(HttpServletRequest.class);

		Map<String, Double> location = Map.of("latitude", 46.0, "longitude", 14.5);
		when(firestoreService.getDocumentData(uid, "dogovorjena-moc", null, null))
				.thenReturn(new HashMap<>(Map.of(
						"1", 2000.0, "2", 3000.0, "3", 4000.0, "4", 5000.0, "5", 6000.0)));
		when(firestoreService.getSubcollections(uid, "prekoracitve"))
				.thenReturn(List.of("2023", "2024"));
		when(firestoreService.getDocumentNamesInSubcollection(uid, "prekoracitve", "2023"))
				.thenReturn(List.of("01"));
		when(firestoreService.getDocumentNamesInSubcollection(uid, "prekoracitve", "2024"))
				.thenReturn(List.of("02"));
		Map<String, Object> prekoracitevDoc = Map.of("value", 123);
		when(firestoreService.getDocumentData(uid, "prekoracitve", "2023", "01"))
				.thenReturn(prekoracitevDoc);
		when(firestoreService.getDocumentData(uid, "prekoracitve", "2024", "02"))
				.thenReturn(prekoracitevDoc);

		UserService userServiceReal = new UserService(fileService, firestoreService);
		UserService userService = Mockito.spy(userServiceReal);

		doReturn(location).when(userService).getClientLocation(request);

		Map<String, Object> result = userService.getUserDataForML(uid, request);

		assertNotNull(result);
		assertTrue(result.containsKey("location"));
		assertTrue(result.containsKey("agreed-power"));
		assertTrue(result.containsKey("prekoracitve"));

		Map<String, Object> ap = (Map<String, Object>) result.get("agreed-power");
		assertEquals(2.0, ap.get("1"));
		assertEquals(6.0, ap.get("5"));

		Map<String, Object> prec = (Map<String, Object>) result.get("prekoracitve");
		assertTrue(prec.containsKey("2023"));
		assertTrue(prec.containsKey("2024"));
		Map<String, Object> months2023 = (Map<String, Object>) prec.get("2023");
		assertEquals(prekoracitevDoc, months2023.get("01"));
		Map<String, Object> months2024 = (Map<String, Object>) prec.get("2024");
		assertEquals(prekoracitevDoc, months2024.get("02"));
	}

}
