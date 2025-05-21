package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.FirestoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

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
@RequestMapping("/firestore")
@Tag(name = "Firesotre", description = "Firestore actions")
public class FirestoreController {

	private final Logger logger = Logger.getLogger(getClass().getName());

	@Autowired
	private FirestoreService service;

	// vse kolekcije
	@GetMapping("/")
	@Operation(summary = "Pridobi vse kolekcije", description = "Pridobi vse kolekcije shranjene v bazo in jih vrne v obliki List<String>.")
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
	@Operation(summary = "Pridobi vse uporabnikove dokumente", description = "Prejme uporabnikov id(uid: string) kot parameter, nato vrne vse njegove dokumente v obliki List<String>.")
	public ResponseEntity<List<String>> getDoc(@RequestParam String uid) {
		try {
			return ResponseEntity.ok(service.getDocumentNamesByUid(uid));
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to fetch documents", e);
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/data")
	@Operation(summary = "Pridobi vse zapise znotraj enega dokumenta", description = "Parameter je uid: string in docId: string. Vrne vse zapise, ki jih vsebuje en uporabnikov dokument v obliki List<Map<String, Object>> ([{YYYY-MM-DD:{DATA}, ...}]).")
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
