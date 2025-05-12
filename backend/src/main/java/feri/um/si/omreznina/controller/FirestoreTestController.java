package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.FirestoreService;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/bill")
public class FirestoreTestController {

    private final Logger logger = Logger.getLogger(getClass().getName());

    @Autowired
    private FirestoreService service;

    @GetMapping()
    public ResponseEntity<List<String>> getName() {
        return ResponseEntity.ok(service.getDatabaseName());
    }

    @GetMapping("/doc")
    public ResponseEntity<List<String>> getDoc() {
        try {
            return ResponseEntity.ok(service.getDocuments());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // pomembno!
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to fetch documents", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
