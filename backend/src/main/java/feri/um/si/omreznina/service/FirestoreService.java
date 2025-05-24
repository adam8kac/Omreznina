package feri.um.si.omreznina.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.concurrent.CancellationException;

@Service
public class FirestoreService {
	private final Firestore db;

	private final Logger logger = Logger.getLogger(getClass().getName());

	public FirestoreService(Firestore firestore) {
		this.db = firestore;
	}

	// Pirodbi vse kolekcije (v root dir - to so user id)
	public List<String> getAllCollections() {
		List<String> colectionNames = new ArrayList<>();
		for (CollectionReference collection : db.listCollections()) {
			colectionNames.add(collection.getId());
		}
		return colectionNames;
	}

	// Pridobi in vrne vse kolekcije znotraj kolekcije
	public List<String> getUserCollections(String uid) {
		List<String> colList = new ArrayList<>();
		CollectionReference userCol = db.collection(uid);
		for (DocumentReference colRef : userCol.listDocuments()) {
			colList.add(colRef.getId());
		}
		return colList;
	}

	public List<String> getDocumentNamesInSubcollection(
			String userId,
			String parentDocId,
			String subcollectionId) {
		List<String> docNames = new ArrayList<>();
		try {
			CollectionReference ref = db
					.collection(userId)
					.document(parentDocId)
					.collection(subcollectionId);

			ApiFuture<QuerySnapshot> future = ref.get();
			List<QueryDocumentSnapshot> documents = future.get().getDocuments();

			for (QueryDocumentSnapshot doc : documents) {
				docNames.add(doc.getId());
			}
		} catch (InterruptedException | ExecutionException e) {
			if (e instanceof InterruptedException) {
				Thread.currentThread().interrupt();
			}
			logger.warning("Failed to fetch documents: " + e.getMessage());
			return null;
		}
		return docNames;
	}

	public List<String> getSubcollections(String uid, String docId) {
		List<String> collectionNames = new ArrayList<>();
		try {
			DocumentReference docRef = db.collection(uid).document(docId);
			Iterable<CollectionReference> collections = docRef.listCollections();
			for (CollectionReference col : collections) {
				collectionNames.add(col.getId());
			}
		} catch (Exception e) {
			logger.warning("Failed to fetch subcollections: " + e.getMessage());
			return null;
		}
		return collectionNames;
	}

	// za shranjevanje denvnih stanj
	public void saveDocumentToCollection(String uid, Map<String, Object> response) {
		try {
			for (Map.Entry<String, Object> entry : response.entrySet()) {
				String yearMonth = entry.getKey();
				@SuppressWarnings("unchecked") // Mogo bi preverit če je entry.getValue() instanceof Map
				Map<String, Object> data = (Map<String, Object>) entry.getValue();

				db.collection(uid)
						.document(yearMonth)
						.set(data)
						.get();
				logger.log(Level.INFO, "Document saved!");
			}
		} catch (CancellationException | ExecutionException | InterruptedException e) {
			if (e instanceof InterruptedException) {
				Thread.currentThread().interrupt();
			}
			logger.warning(e.toString());
		}
	}

	// pridboi podatke znotraj kolekcije ali ap podkolekcije
	public Map<String, Object> getDocumentData(
			String uid,
			String docId,
			String subcollectionId,
			String subColDocId) {
		try {
			DocumentReference docRef;
			if (subcollectionId != null && subColDocId != null) {
				docRef = db.collection(uid)
						.document(docId)
						.collection(subcollectionId)
						.document(subColDocId);
			} else {
				docRef = db.collection(uid)
						.document(docId);
			}
			DocumentSnapshot docSnap = docRef.get().get();
			if (docSnap.exists()) {
				return docSnap.getData();
			}
		} catch (InterruptedException | ExecutionException e) {
			if (e instanceof InterruptedException) {
				Thread.currentThread().interrupt();
			}
			logger.warning("Failed to fetch documents: " + e.getMessage());
			return Collections.emptyMap();
		}
		return Collections.emptyMap();
	}

	// Za shranjevanje prekoracitev
	public void saveSingleDocument(String uid, String docId, Map<String, Map<String, Map<String, Object>>> data) {
		try {
			for (Map.Entry<String, Map<String, Map<String, Object>>> yearEntry : data.entrySet()) {
				String year = yearEntry.getKey();
				Map<String, Map<String, Object>> monthsMap = yearEntry.getValue();

				for (Map.Entry<String, Map<String, Object>> monthEntry : monthsMap.entrySet()) {
					String month = monthEntry.getKey();
					Map<String, Object> monthData = monthEntry.getValue();

					db.collection(uid)
							.document(docId)
							.collection(year)
							.document(month)
							.set(monthData)
							.get();

					logger.info("Saved document for user");
				}
			}
		} catch (InterruptedException | ExecutionException e) {
			if (e instanceof InterruptedException) {
				Thread.currentThread().interrupt();
			}
			logger.warning("Failed to save single document: " + e.getMessage());
		}
	}

}
