package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.service.UserService;
import feri.um.si.omreznina.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@SuppressWarnings("unchecked")
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

	@PostMapping("/prediction/monthly-overrun")
	public ResponseEntity<?> predictMonthlyOverrun(@RequestBody Map<String, Object> body, HttpServletRequest request) {
		String uid = (String) body.get("uid");
		String predictionYear = body.get("year").toString();
		String predictionMonth = body.get("month").toString();

		Map<String, Double> location = userService.getClientLocation(request);

		Double lat = (location != null && location.get("latitude") != null) ? location.get("latitude") : 46.0569;
		Double lon = (location != null && location.get("longitude") != null) ? location.get("longitude") : 14.5058;

		Map<String, Object> dataForML;
		try {
			dataForML = userService.getUserDataForML(uid, request);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Napaka pri pripravi podatkov za napoved.");
		}

		Map<String, Object> allYears = (Map<String, Object>) dataForML.get("prekoracitve");
		if (allYears == null || allYears.isEmpty()) {
			return ResponseEntity.badRequest().body("Ni podatkov o prekoracitvah.");
		}

		int refYear = Integer.parseInt(predictionYear) - 1;
		String refYearStr = Integer.toString(refYear);

		Map<String, Object> yearMap = null;
		if (allYears.containsKey(refYearStr)) {
			yearMap = (Map<String, Object>) allYears.get(refYearStr);
		}
		if (yearMap == null) {
			return ResponseEntity.badRequest().body("Ni podatkov za izbran mesec (" + refYearStr + "-" + predictionMonth + ")!");
		}
		Map<String, Object> monthMap = null;
		if (yearMap.containsKey(predictionMonth)) {
			monthMap = (Map<String, Object>) yearMap.get(predictionMonth);
		}
		if (monthMap == null) {
			return ResponseEntity.badRequest().body("Ni podatkov za izbran mesec (" + refYearStr + "-" + predictionMonth + ")!");
		}

		// Če pride do napake pri python klicu, ujemi napako
		try {
			Map<String, Object> pythonReq = new HashMap<>();
			pythonReq.put("lat", lat);
			pythonReq.put("lon", lon);
			pythonReq.put("year", refYearStr);
			pythonReq.put("month", predictionMonth);
			pythonReq.put("data", monthMap);

			RestTemplate restTemplate = new RestTemplate();
			String pythonUrl = "http://localhost:8000/detailed_stats";
			Object result = restTemplate.postForObject(pythonUrl, pythonReq, Object.class);

			return ResponseEntity.ok(result);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Napaka pri pripravi podatkov za napoved.");
		}
	}
}
