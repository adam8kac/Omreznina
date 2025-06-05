package feri.um.si.omreznina.service;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;

import feri.um.si.omreznina.exceptions.IpAddressException;
import feri.um.si.omreznina.exceptions.UserException;
import jakarta.servlet.http.HttpServletRequest;

import java.io.InputStream;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class UserService {

	private final Logger logger = Logger.getLogger(getClass().getName());

	private FileService fileService;

	FirestoreService firestoreService;

	public UserService(FileService fileService, FirestoreService firestoreService) {
		this.fileService = fileService;
		this.firestoreService = firestoreService;
	}

	public void processAndStoreUserData(MultipartFile file, String uid) throws UserException {

		if (!isUserVerified(uid)) {
			throw new UserException(uid + " does not have  verified email!");
		}

		processAndStoreFile(file, uid, null, null);

	}

	public void processAndStoreMaxPowerConsumption(MultipartFile file, String powerByMonths,
			String uid) throws UserException {

		if (!isUserVerified(uid)) {
			throw new UserException(uid + " does not have  verified email!");
		}

		String parser = "prekoracitve";
		processAndStoreFile(file, uid, powerByMonths, parser);

	}

	public void computeAndStoreOptimalPower(MultipartFile file, String powerByMonths,
			String uid) throws UserException {
		if (!isUserVerified(uid) || uid == null) {
			throw new UserException(uid + " does not have  verified email!");
		}

		String parser = "optimum";
		processAndStoreFile(file, uid, powerByMonths, parser);
	}

	public Map<String, Double> getClientLocation(HttpServletRequest request) {
		try {
			String ipAddress = getIpAddress(request);

			if (!ipAddress.matches("^([0-9]{1,3}\\.){3}[0-9]{1,3}$") && !ipAddress.contains(":")) {
				throw new IllegalArgumentException("Invalid IP address format: " + ipAddress);
			}

			logger.info("ip v getClient " + ipAddress);
			Map<String, Double> location = new HashMap<>();

			try {
				InputStream database = getClass().getResourceAsStream(
						"/geoip/GeoLite2-City.mmdb");
				DatabaseReader dbReader = new DatabaseReader.Builder(database).build();
				CityResponse response = dbReader.city(InetAddress.getByName(ipAddress));
				logger.info("response user service " + response);

				double latitude = response.getLocation().getLatitude();
				double longitude = response.getLocation().getLongitude();
				logger.info("lat: " + latitude + " lon " + longitude);

				location.put("latitude", latitude);
				location.put("longitude", longitude);

				return location;
			} catch (Exception e) {
				logger.warning(e.toString());
			}
		} catch (IpAddressException e) {
			logger.warning(e.getMessage());
		}

		return null;
	}

	public Map<String, Object> getUserDataForML(@RequestParam("uid") String uid, HttpServletRequest request)
			throws UserException {
		Map<String, Object> jsonObject = new LinkedHashMap<>();
		if (uid == null || uid.isEmpty()) {
			throw new UserException("User ID is null");
		}

		Object location = getClientLocation(request);
		if (location != null) {
			jsonObject.put("location", location);
		}

		Map<String, Object> agreedPowers = firestoreService.getDocumentData(uid, "dogovorjena-moc", null, null);
		if (agreedPowers != null) {
			for (int i = 1; i <= 5; i++) {
				double agreedPower = (Double) agreedPowers.get(Integer.toString(i));
				agreedPowers.put(Integer.toString(i), agreedPower / 1000);
			}
			jsonObject.put("agreed-power", agreedPowers);
		}

		Map<String, Object> prekoracitveMap = new LinkedHashMap<>();
		List<String> years = firestoreService.getSubcollections(uid, "prekoracitve");
		for (String year : years) {
			Map<String, Object> monthsMap = new LinkedHashMap<>();
			List<String> months = firestoreService.getDocumentNamesInSubcollection(uid, "prekoracitve", year);
			for (String month : months) {
				Map<String, Object> prekoracitve = firestoreService.getDocumentData(uid, "prekoracitve", year, month);
				monthsMap.put(month, prekoracitve);
			}
			prekoracitveMap.put(year, monthsMap);
		}
		jsonObject.put("prekoracitve", prekoracitveMap);

		return jsonObject;
	}

	private String getIpAddress(HttpServletRequest request) throws IpAddressException {
		String ipAddress = request.getHeader("X-Real-IP");
		logger.info("ip address: " + ipAddress);
		if (ipAddress != null && !ipAddress.isEmpty()) {
			return ipAddress;
		}
		ipAddress = request.getHeader("X-Forwarded-For");
		if (ipAddress != null && !ipAddress.isEmpty()) {
			return ipAddress;
		}
		ipAddress = request.getRemoteAddr();
		if (ipAddress != null && !ipAddress.isEmpty()) {
			return ipAddress;
		}
		throw new IpAddressException("Getting ip address failed: " + ipAddress);
	}

	private void processAndStoreFile(MultipartFile file, String uid, String powerByMonths, String parser) {
		String response = null;

		try {
			ObjectMapper mapper = new ObjectMapper();

			if (powerByMonths != null && parser.equals("prekoracitve")) {
				logger.log(Level.INFO, "Sending to python-agreed-power");
				response = fileService.uploadMaxPowerConsumed(file, powerByMonths);

				Map<String, Map<String, Map<String, Object>>> parsed = mapper.readValue(
						response, new TypeReference<>() {
						});

				firestoreService.saveDocumentToCollection(uid, "prekoracitve", parsed);
			} else if (powerByMonths != null && parser.equals("optimum")) {
				logger.log(Level.INFO, "Sending to python-agreed-power");
				response = fileService.calculateOptimalConsumtion(file, powerByMonths);

				Map<String, Map<String, Map<String, Object>>> parsed = mapper.readValue(
						response, new TypeReference<>() {
						});

				firestoreService.saveDocumentToCollection(uid, "optimum", parsed);
			} else {

				logger.log(Level.INFO, "Sending to python-parser");
				response = fileService.sendFileToParser(file);

				Map<String, Map<String, Map<String, Object>>> parsed = mapper.readValue(
						response, new TypeReference<>() {
						});

				firestoreService.saveDocumentToCollection(uid, "poraba", parsed);

			}
		} catch (

		Exception e) {
			logger.log(Level.SEVERE, "File processing failed", e);
		}
	}

	private boolean isUserVerified(String uid) {
		try {
			UserRecord user = FirebaseAuth.getInstance().getUser(uid);
			return user.isEmailVerified();
		} catch (FirebaseAuthException e) {
			logger.log(Level.SEVERE, "User does not exist");
			return false;
		}
	}

}
