package feri.um.si.omreznina.service;

import feri.um.si.omreznina.model.MfaSettings;
import jakarta.annotation.PostConstruct;
import org.apache.commons.codec.binary.Base32;
import org.apache.commons.codec.binary.Hex;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import de.taimos.totp.TOTP;

@Service
public class MfaService {

	@Value("${mfa.secret.encryption-key}")
	private String encryptionKey;

	private SecretKeySpec aesKeySpec;

	@Autowired
	private FirestoreService firestoreService;

	public MfaService(FirestoreService firestoreService) {
		this.firestoreService = firestoreService;
	}

	@PostConstruct
	public void initKey() {
		byte[] keyBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);
		aesKeySpec = new SecretKeySpec(keyBytes, "AES");
	}

	public void saveSettings(String uid, String secret, boolean enabled) throws Exception {
		if (secret == null || secret.isBlank()) {
			throw new IllegalArgumentException("Secret ne sme biti prazen!");
		}

		String encryptedSecret = encrypt(secret);
		MfaSettings settings = new MfaSettings(uid, enabled, encryptedSecret);

		firestoreService.saveMfaSettings(uid, settings);
	}

	public boolean verifyTotpCode(String uid, String code) {
		try {
			MfaSettings settings = firestoreService.getMfaSettings(uid);
			if (settings == null || !settings.isEnabled())
				return false;

			String decryptedSecret = decrypt(settings.getSecretHash());

			Base32 base32 = new Base32();
			byte[] bytes = base32.decode(decryptedSecret);
			String hexKey = Hex.encodeHexString(bytes);

			String generatedCode = TOTP.getOTP(hexKey);
			return generatedCode.equals(code);

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	private String decrypt(String encryptedSecret) throws Exception {
		Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
		cipher.init(Cipher.DECRYPT_MODE, aesKeySpec);
		byte[] decoded = Base64.getDecoder().decode(encryptedSecret);
		byte[] decrypted = cipher.doFinal(decoded);
		return new String(decrypted, StandardCharsets.UTF_8);
	}

	private String encrypt(String secret) throws Exception {
		Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
		cipher.init(Cipher.ENCRYPT_MODE, aesKeySpec);
		byte[] encrypted = cipher.doFinal(secret.getBytes(StandardCharsets.UTF_8));
		return Base64.getEncoder().encodeToString(encrypted);
	}
}