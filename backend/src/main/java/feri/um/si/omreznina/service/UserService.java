package feri.um.si.omreznina.service;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        Logger logger = Logger.getLogger(getClass().getName());

        if (user == null) {
            throw new UserException("Could not update null!");
        }
        logger.log(Level.INFO, user.getPassword());

        User newUser = userRepository.findById(user.getId()).get();
        boolean updated = false;

        if (!newUser.getEmail().equals(user.getEmail())) {
            newUser.setEmail(user.getEmail());
            logger.log(Level.INFO, user.getEmail());
            updated = true;
        }
        if (!newUser.getFirstName().equals(user.getFirstName())) {
            newUser.setFirstName(user.getFirstName());
            logger.log(Level.INFO, user.getFirstName());

            updated = true;
        }
        if (!newUser.getLastName().equals(user.getLastName())) {
            newUser.setLastName(user.getLastName());
            logger.log(Level.INFO, user.getLastName());
            updated = true;
        }
        if (!encoder.matches(user.getPassword(), newUser.getPassword())) {
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
