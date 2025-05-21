package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Tag(name = "User", description = "User actions")
@RequestMapping("/user")
// @CrossOrigin(origins = "*")
public class UserController {

	@Autowired
	private UserService userService;

	@PostMapping("/upload-file")
	@Operation(summary = "Naloži datoteko dnevnih stanj", description = "Uporabnik lahko preko tega Endpointa naloži datoteko tipa XLSX ali pa CSV, sprejme parameter file: MultipartFile(datoteka ki jo naloži uporabnik), UID: string, ki je enak uporabnikovem ID-ju v FirebaseAuth, datoteko nato pošlje python helperju, ki jo sprocesira in vrne odatke v obliki pripravljeni za shranjevanje v bazo")
	public ResponseEntity<String> uploadFile(@RequestPart("file") MultipartFile file, @RequestParam("uid") String uid) {
		try {
			userService.processAndStoreUserData(file, uid);
			return ResponseEntity.ok().body("Document added successfuly");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Could not save document");
		}
	}

	@PostMapping("/upload-power-consumption")
	@Operation(summary = "Naloži datoteko prekoracitev", description = "Uporabnik lahko preko tega Endpointa naloži datoteko tipa XLSX ali pa CSV, sprejme parameter file: MultipartFile(datoteka ki jo naloži uporabnik), UID: string, ki je enak uporabnikovem ID-ju v FirebaseAuth, datoteko nato pošlje python helperju, ki jo sprocesira in vrne odatke v obliki pripravljeni za shranjevanje v bazo")
	public ResponseEntity<String> uploadPowerConsumption(@RequestPart("file") MultipartFile file,
			@RequestParam("uid") String uid) {
		try {
			userService.processAndStoreMaxPowerConsumption(file, uid);
			return ResponseEntity.ok().body("Document added successfuly");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Could not save document");
		}
	}

}
