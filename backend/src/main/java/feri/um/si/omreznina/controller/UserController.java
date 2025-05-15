package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
// @CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

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
