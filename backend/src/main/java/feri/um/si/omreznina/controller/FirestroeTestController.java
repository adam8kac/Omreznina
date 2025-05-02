package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.FirestoreTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bill")
public class FirestroeTestController {

    @Autowired
    private FirestoreTestService service;

    @GetMapping()
    public ResponseEntity<List<String>> getName() {
        return ResponseEntity.ok(service.getDatabaseName());
    }

    @GetMapping("/doc")
    public ResponseEntity<List<String>> getDoc() {
        try {
            return ResponseEntity.ok(service.getDocuments());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
