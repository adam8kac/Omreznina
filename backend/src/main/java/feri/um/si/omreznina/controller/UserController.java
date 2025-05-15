package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
// @CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            userService.register(user);
            return new ResponseEntity<>("User created", HttpStatus.CREATED);
        } catch (UserException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody User user) {
        try {
            userService.updateProfile(user);
            return new ResponseEntity<>("User updated", HttpStatus.CREATED);
        } catch (UserException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/upload-file")
    public ResponseEntity<String> uploadFile(@RequestPart("file") MultipartFile file, @RequestParam("uid") String uid) {
        try {
            userService.processAndStoreFile(file, uid);
            return ResponseEntity.ok().body("Document added successfuly");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Could not save document");
        }
    }

}
