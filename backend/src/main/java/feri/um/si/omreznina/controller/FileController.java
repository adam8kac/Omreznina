package feri.um.si.omreznina.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import feri.um.si.omreznina.service.FileService;

import org.springframework.http.HttpStatus;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

// to gre v userja pol
@RestController
@RequestMapping("/file")
public class FileController {

    @Autowired
    private final FileService fileServiceTest;

    private final Logger logger = Logger.getLogger(getClass().getName());

    public FileController(FileService fileServiceTest) {
        this.fileServiceTest = fileServiceTest;
    }

    // To ne bo endpoint to je sam test če dela, ko bo fixno bo makePythonCall
    // shranjen v firebase, get pa bo dobo iz firebase shranit pa se more kot
    // USER_ID_FIRBEASE {...kar vrne python} kot en dokument
    @GetMapping("/")
    public ResponseEntity<String> getData() {
        try {
            String response = fileServiceTest.makePythonCall();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.warning(Level.SEVERE + ": " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

}
