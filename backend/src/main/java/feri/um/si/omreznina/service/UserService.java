package feri.um.si.omreznina.service;

import com.google.type.DateTime;
import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.repository.UserRepository;
import org.checkerframework.common.aliasing.qual.Unique;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

//Lahko bi poslal kar cel User objekt pa potem user.getAttribute pa preveril če je kaj null.... FIX!
    public void register(String firebaseUid, String email, String firstName, String lastName, String password) {
        if (email == null || password == null || userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = new User();
        user.setFirebaseUid(firebaseUid);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword(password);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }
}
