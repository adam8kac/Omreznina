package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.FirestoreService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/documents")
public class FirestoreController {

    private final Logger logger = Logger.getLogger(getClass().getName());

    @Autowired
    private FirestoreService service;

    // vse kolekcije
    @GetMapping("/")
    public ResponseEntity<List<String>> getAll() {
        try {
            return ResponseEntity.ok(service.getAllCollections());
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to fetch documents", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // vse dokumente v kolekciji
    @GetMapping("/documents")
    public ResponseEntity<List<String>> getDoc(@RequestParam String uid) {
        try {
            return ResponseEntity.ok(service.getDocumentNamesByUid(uid));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to fetch documents", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/data")
    public ResponseEntity<List<Map<String, Object>>> getDocumentData(@RequestParam String uid,
            @RequestParam String docId) {
        try {
            return ResponseEntity.ok(service.getAllDataFromDocument(uid, docId));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to fetch documents", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
