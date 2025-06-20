package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.model.ManualInvoice;
import feri.um.si.omreznina.service.FirestoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

	@GetMapping("/documents")
	@Operation(summary = "Pridobi vse kolekcije ki jih ima user", description = "Prejme uid kot aprameter in vrne vse kolekcije ki jih ima uporabnik")
	public ResponseEntity<List<String>> getUsersCollections(@RequestParam String uid) {
		try {
			return ResponseEntity.ok(service.getUserCollections(uid));
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to fetch users collections", e);
			return ResponseEntity.badRequest().build();
		}
	}

	// pdokolekcije znotraj dokumenta (racun/poraba>podkolekcije)
	@GetMapping("/subCollections")
	public ResponseEntity<List<String>> getSubcollections(
			@RequestParam String uid,
			@RequestParam String docId) {
		List<String> subcollections = service.getSubcollections(uid, docId);
		if (subcollections == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(subcollections);
	}

	// Dokumenti znotrja podkolekcije
	@GetMapping("/docsInSubCol")
	public ResponseEntity<List<String>> getSubcollectionDocumentIds(
			@RequestParam String uid,
			@RequestParam String parentDocId,
			@RequestParam String subcollectionId) {
		List<String> docs = service.getDocumentNamesInSubcollection(uid, parentDocId, subcollectionId);
		if (docs == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(docs);
	}

	@GetMapping("/data")
	public ResponseEntity<Map<String, Object>> getDocumentData(
			@RequestParam String uid,
			@RequestParam String docId,
			@RequestParam(required = false) String subColId,
			@RequestParam(required = false) String subColDocId) {
		try {
			Map<String, Object> data = service.getDocumentData(uid, docId, subColId, subColDocId);
			if (data.isEmpty()) {
				return ResponseEntity.notFound().build();
			}
			return ResponseEntity.ok(data);
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Failed to fetch document", e);
			return ResponseEntity.badRequest().build();
		}
	}

	@PostMapping("/manual")
	public ResponseEntity<String> saveManualInvoice(@RequestBody ManualInvoice invoice) {
		try {
			service.saveManualInvoice(invoice);
			return ResponseEntity.ok("Račun uspešno shranjen.");
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Napaka pri shranjevanju računa", e);
			return ResponseEntity.status(500).body("Napaka: " + e.getMessage());
		}
	}

	@PostMapping("/setEt")
	public ResponseEntity<String> saveEt(@RequestParam String uid) {
		try {
			service.saveTariff(uid);
			return ResponseEntity.ok("Et added");
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Napaka pri shranjevanju tarife", e);
			return ResponseEntity.badRequest().build();
		}
	}

	@PostMapping("/set-toplotna")
	public ResponseEntity<String> saveToplotna(@RequestParam String uid, @RequestParam double power,
			@RequestParam double temparature) {
		try {
			service.saveToplotnaCrpalka(uid, power, temparature);
			return ResponseEntity.ok("Toplotna crpalka added");
		} catch (Exception e) {
			logger.log(Level.SEVERE, "Napaka pri shranjevanju toplotne", e);
			return ResponseEntity.badRequest().build();
		}
	}

	@DeleteMapping("remove-document")
	public ResponseEntity<String> removeDocument(@RequestParam String uid, @RequestParam String docId) {
		try {
			logger.info("YUP");
			service.removeDocument(uid, docId);
			return ResponseEntity.ok("Document removed");
		} catch (Exception e) {
			logger.log(Level.INFO, "Napaka pri odstrnajevanju dokumenta.", e);
			return ResponseEntity.badRequest().build();
		}
	}

	@DeleteMapping("remove-subDocument")
	public ResponseEntity<String> romveSubCollection(@RequestParam String uid, @RequestParam String docId,
			@RequestParam String subColId, @RequestParam String subDocId) {
		try {
			service.removeSubCollection(uid, docId, subColId, subDocId);
			return ResponseEntity.ok("SubDocument removed");
		} catch (Exception e) {
			logger.log(Level.INFO, "Napaka pri odstrnajevanju pod dokumenta.", e);
			return ResponseEntity.badRequest().build();
		}
	}

	@DeleteMapping("remove")
	public ResponseEntity<String> semove(@RequestParam String uid, @RequestParam String docId) {
		try {
			service.removeDocumentAndSubcollections(uid, docId);
			return ResponseEntity.ok("SubDocument removed");
		} catch (Exception e) {
			logger.log(Level.INFO, "Napaka pri odstrnajevanju pod dokumenta.", e);
			return ResponseEntity.badRequest().build();
		}
	}
}
