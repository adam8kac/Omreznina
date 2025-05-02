package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        userService.register(
                user.getFirebaseUid(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPassword()
        );
        return new ResponseEntity<>("User created", HttpStatus.CREATED);
    }

}
