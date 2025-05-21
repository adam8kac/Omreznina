package feri.um.si.omreznina.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;

import feri.um.si.omreznina.exceptions.UserException;

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
		String pythonMethod = "processAndStoreUserData";

		if (!isUserVerified(uid)) {
			throw new UserException(uid + " does not have  verified email!");
		}

		processAndStoreFile(file, uid, pythonMethod);

	}

	public void processAndStoreMaxPowerConsumption(MultipartFile file, String uid) throws UserException {
		String pythonMethod = "procesAndStoreMaxPowerConsumption";

		if (!isUserVerified(uid)) {
			throw new UserException(uid + " does not have  verified email!");
		}

		processAndStoreFile(file, uid, pythonMethod);

	}

	private void processAndStoreFile(MultipartFile file, String uid, String typeOfFile) {
		String response = null;

		try {
			ObjectMapper mapper = new ObjectMapper();

			if ("processAndStoreUserData".equals(typeOfFile)) {
				response = fileService.sendFileToParser(file);

				List<Map<String, Object>> parsed = mapper.readValue(response, new TypeReference<>() {
				});

				for (Map<String, Object> doc : parsed) {
					firestoreService.saveDocumentToCollection(uid, doc);
				}
			} else {
				response = fileService.uploadMaxPowerConsumed(file);

				Map<String, Map<String, Map<String, Object>>> parsed = mapper.readValue(
						response, new TypeReference<>() {
						});

				firestoreService.saveSingleDocument(uid, "poraba", parsed);
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
