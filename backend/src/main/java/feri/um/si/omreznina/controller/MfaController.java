package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.model.MfaSettings;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.MfaService;
import lombok.Data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/firestore/mfa")
public class MfaController {

	@Autowired
	private final MfaService mfaService;

	@Autowired
	private final FirestoreService firestoreService;

	public MfaController(MfaService mfaService, FirestoreService firestoreService) {
		this.mfaService = mfaService;
		this.firestoreService = firestoreService;
	}

	@PostMapping("/setup")
	public ResponseEntity<String> setupMfa(@RequestBody SetupRequest request) {
		try {
			mfaService.saveSettings(request.getUid(), request.getSecret(), request.isEnabled());
			return ResponseEntity.ok("MFA nastavitve uspešno shranjene.");
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Napaka: " + e.getMessage());
		}
	}

	@GetMapping("/{uid}")
	public ResponseEntity<MfaSettings> getSettings(@PathVariable String uid) {
		MfaSettings settings = firestoreService.getMfaSettings(uid);
		if (settings == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(settings);
	}

	@PostMapping("/verify")
	public ResponseEntity<Boolean> verifyCode(@RequestBody VerifyRequest request) {
		boolean isValid = mfaService.verifyTotpCode(request.getUid(), request.getCode());
		return ResponseEntity.ok(isValid);
	}

	@Data
	public static class SetupRequest {
		private String uid;
		private String secret;
		private boolean enabled;
	}

	@Data
	public static class VerifyRequest {
		private String uid;
		private String code;
	}
}