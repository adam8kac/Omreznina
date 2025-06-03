package feri.um.si.omreznina.mfaTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

import feri.um.si.omreznina.model.MfaSettings;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.MfaService;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@SuppressWarnings("removal")
public class MfaServiceTest {

	@MockBean
	private FirestoreService firestoreService;
	@MockBean
	private MfaService mfaService;

	@BeforeEach
	void setUp() {
		firestoreService = mock(FirestoreService.class);
		mfaService = new MfaService(firestoreService);

		TestUtils.setField(mfaService, "encryptionKey", "1234567890123456");
		mfaService.initKey();
	}

	@Test
	void testSaveSettings_savesEncryptedSettings() throws Exception {
		String secret = "MYSECRETBASE32";
		String uid = "user1";
		boolean enabled = true;

		mfaService.saveSettings(uid, secret, enabled);

		verify(firestoreService).saveMfaSettings(eq(uid), argThat(settings -> settings.getUid().equals(uid) &&
				settings.isEnabled() == enabled &&
				!settings.getSecretHash().equals(secret) && 
				settings.getSecretHash() != null));
	}

	@Test
	void testSaveSettings_throwsExceptionOnBlankSecret() {
		String blank = "";
		assertThrows(IllegalArgumentException.class, () -> mfaService.saveSettings("u", blank, true));
	}

	@Test
	void testVerifyTotpCode_disabled_returnsFalse() {
		MfaSettings settings = new MfaSettings("u", false, "abc");
		when(firestoreService.getMfaSettings("u")).thenReturn(settings);
		boolean result = mfaService.verifyTotpCode("u", "123456");
		assertFalse(result);
	}

	@Test
	void testVerifyTotpCode_nullSettings_returnsFalse() {
		when(firestoreService.getMfaSettings("u")).thenReturn(null);
		assertFalse(mfaService.verifyTotpCode("u", "111111"));
	}

	@Test
	void testVerifyTotpCode_wrongCode_returnsFalse() throws Exception {
		String secret = "JBSWY3DPEHPK3PXP"; 
		String encrypted = (String) TestUtils.invokePrivate(mfaService, "encrypt", secret);

		MfaSettings settings = new MfaSettings("u", true, encrypted);
		when(firestoreService.getMfaSettings("u")).thenReturn(settings);

		assertFalse(mfaService.verifyTotpCode("u", "000000"));
	}

	@Test
	void testEncryptAndDecrypt_areInverse() throws Exception {
		String original = "JBSWY3DPEHPK3PXP";
		String encrypted = (String) TestUtils.invokePrivate(mfaService, "encrypt", original);
		String decrypted = (String) TestUtils.invokePrivate(mfaService, "decrypt", encrypted);
		assertEquals(original, decrypted);
	}

	static class TestUtils {
		static void setField(Object obj, String fieldName, Object value) {
			try {
				var f = obj.getClass().getDeclaredField(fieldName);
				f.setAccessible(true);
				f.set(obj, value);
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		}

		static Object invokePrivate(Object obj, String methodName, Object... args) throws Exception {
			var method = obj.getClass().getDeclaredMethod(methodName, String.class);
			method.setAccessible(true);
			return method.invoke(obj, args);
		}
	}
}
