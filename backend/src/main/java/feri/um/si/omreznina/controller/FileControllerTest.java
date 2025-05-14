package feri.um.si.omreznina.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import feri.um.si.omreznina.service.FileServiceTest;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

// to gre v userja pol
@RestController
@RequestMapping("/file")
public class FileControllerTest {

    @Autowired
    private final FileServiceTest fileServiceTest;

    public FileControllerTest(FileServiceTest fileServiceTest) {
        this.fileServiceTest = fileServiceTest;
    }

    @GetMapping("/")
    public ResponseEntity<String> getData() {
        String response = fileServiceTest.makePythonCall();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
