package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.service.UserService;
import feri.um.si.omreznina.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Tag(name = "User", description = "User actions")
@RequestMapping("/user")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private WeatherService weatherService;

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
			@RequestParam("power_by_months") String powerByMonths,
			@RequestParam("uid") String uid) {
		try {
			userService.processAndStoreMaxPowerConsumption(file, powerByMonths, uid);
			return ResponseEntity.ok().body("Document added successfuly");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Could not save document");
		}
	}

	@PostMapping("/optimal-power")
	public ResponseEntity<String> uploadAndOptimize(@RequestPart("file") MultipartFile file,
			@RequestParam("power_by_months") String powerByMonths, @RequestParam("uid") String uid) {
		try {
			userService.computeAndStoreOptimalPower(file, powerByMonths, uid);
			return ResponseEntity.ok().body("Document added successfuly");
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/location")
	public ResponseEntity<Map<String, Double>> getLocation(HttpServletRequest request) {
		return ResponseEntity.ok(userService.getClientLocation(request));
	}

	@GetMapping("/current-temparature")
	public ResponseEntity<Object> getCurrentTemperature(HttpServletRequest request) {
		Map<String, Double> location = userService.getClientLocation(request);

		return ResponseEntity.ok(weatherService.getWeatherInfo(location.get("latitude"), location.get("longitude")));
	}

	@GetMapping("/llm-data")
	public ResponseEntity<Map<String, Object>> getDataForLLM(HttpServletRequest request,
			@RequestParam("uid") String uid) {
		try {

			if (uid == null || !uid.matches("^[a-zA-Z0-9_-]{28}$")) {
				throw new UserException("Invalid UID format");
			}

			Map<String, Object> jsonObject = userService.getUserDataForML(uid, request);
			return ResponseEntity.ok(jsonObject);
		} catch (UserException e) {
			return ResponseEntity.badRequest().build();
		}
	}
}
