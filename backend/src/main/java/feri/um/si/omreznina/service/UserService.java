package feri.um.si.omreznina.service;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.UnknownHostException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final Logger logger = Logger.getLogger(getClass().getName());

    @Autowired
    private FileService fileService;

    @Autowired
    FirestoreService firestoreService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    public void register(User user) throws UserException {

        String email = user.getEmail();
        String password = user.getPassword();

        if (email == null || password == null || userRepository.findByEmail(email).isPresent()
                || user.getId() != null) {
            throw new UserException("Invalid user");
        }

        user.setPassword(hashPassword(password));
        user.setFirebaseUid(generateFirebaseUid());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    public void updateProfile(User user) throws UserException {

        if (user == null || user.getId() == null) {
            throw new UserException("Could not update null!");
        }

        User newUser = userRepository.findById(user.getId()).get();
        boolean updated = false;

        if (user.getEmail() != null && !newUser.getEmail().equals(user.getEmail())) {
            newUser.setEmail(user.getEmail());
            logger.log(Level.INFO, user.getEmail());
            updated = true;
        }
        if (user.getFirstName() != null && !newUser.getFirstName().equals(user.getFirstName())) {
            newUser.setFirstName(user.getFirstName());
            logger.log(Level.INFO, user.getFirstName());

            updated = true;
        }
        if (user.getLastName() != null && !newUser.getLastName().equals(user.getLastName())) {
            newUser.setLastName(user.getLastName());
            logger.log(Level.INFO, user.getLastName());
            updated = true;
        }
        if (user.getPassword() != null && !encoder.matches(user.getPassword(), newUser.getPassword())) {
            newUser.setPassword(hashPassword(user.getPassword()));
            logger.log(Level.INFO, user.getPassword());
            updated = true;
        }

        if (updated) {
            newUser.setUpdatedAt(LocalDateTime.now());
            userRepository.save(newUser);
        } else {
            throw new UserException("Nothing changed");
        }
    }

    public void processAndStoreFile(MultipartFile file, String uid) {
        try {
            fileService.saveFile(file);

            String response = fileService.makePythonCall();
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> parsed = mapper.readValue(response, new TypeReference<>() {
            });

            for (Map<String, Object> doc : parsed) {
                firestoreService.saveDocumentToCollection(uid, doc);
            }

            fileService.removeFile(file);
        } catch (UnknownHostException e) {
            logger.log(Level.SEVERE, e.toString());
        } catch (IOException e) {
            logger.log(Level.SEVERE, e.toString());
        }
    }

    private String generateFirebaseUid() {
        String uid = UUID.randomUUID().toString();
        if (userRepository.findByFirebaseUid(uid).isPresent()) {
            return generateFirebaseUid();
        }
        return uid;
    }

    private String hashPassword(String password) throws UserException {
        if (password != null) {
            return encoder.encode(password);
        }
        throw new UserException("password can not be null");
    }
}
