package feri.um.si.omreznina.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;

import feri.um.si.omreznina.model.ManualInvoice;
import org.springframework.stereotype.Service;

import java.util.*;

import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;
import java.util.concurrent.CancellationException;

@Service
public class FirestoreService {
	private final Firestore db;

	private final Logger logger = Logger.getLogger(getClass().getName());

	public FirestoreService(Firestore firestore) {
		this.db = firestore;
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

	public void saveDocumentToCollection(String uid, String docId, Map<String, Map<String, Map<String, Object>>> data) {
		List<ApiFuture<WriteResult>> futures = new ArrayList<>();

		try {
			for (Map.Entry<String, Map<String, Map<String, Object>>> yearEntry : data.entrySet()) {
				String year = yearEntry.getKey();
				Map<String, Map<String, Object>> monthsMap = yearEntry.getValue();

				for (Map.Entry<String, Map<String, Object>> monthEntry : monthsMap.entrySet()) {
					String month = monthEntry.getKey();
					Map<String, Object> monthData = monthEntry.getValue();

					ApiFuture<WriteResult> future = db.collection(uid)
							.document(docId)
							.collection(year)
							.document(month)
							.set(monthData);

					futures.add(future);
				}
			}

			for (ApiFuture<WriteResult> future : futures) {
				future.get(); 
			}
			logger.info("All documents saved for user");
		} catch (InterruptedException | ExecutionException e) {
			if (e instanceof InterruptedException) {
				Thread.currentThread().interrupt();
			}
			logger.warning("Failed to save documents: " + e.getMessage());
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

	public List<String> getAllCollections() {
		List<String> colectionNames = new ArrayList<>();
		for (CollectionReference collection : db.listCollections()) {
			colectionNames.add(collection.getId());
		}
		return colectionNames;
	}

	public List<String> getDocumentNamesByUid(String uid) {
		ApiFuture<QuerySnapshot> future = db.collection(uid).get();
		List<String> docNames = new ArrayList<>();

		try {
			List<QueryDocumentSnapshot> documents = future.get().getDocuments();
			for (QueryDocumentSnapshot doc : documents) {
				docNames.add(doc.getId());
			}
			return docNames;
		} catch (ExecutionException | InterruptedException | CancellationException e) {
			if (e instanceof InterruptedException) {
				Thread.currentThread().interrupt();
			}
			logger.warning(e.getClass().getSimpleName() + " while fetching collection by UID: " + e.getMessage());
			return null;
		}
	}

	// Za dnevna stanja
	public List<Map<String, Object>> getAllDataFromDocument(String uid, String docId) {
		List<Map<String, Object>> documentDataList = new ArrayList<>();
		ApiFuture<QuerySnapshot> future = db.collection(uid).get();

		try {
			List<QueryDocumentSnapshot> documents = future.get().getDocuments();
			for (QueryDocumentSnapshot document : documents) {
				if (document.getId().equals(docId)) {
					Map<String, Object> data = document.getData();
					List<Map.Entry<String, Object>> sortedEntries = new ArrayList<>(data.entrySet());
					sortedEntries.sort(Comparator.comparing(Map.Entry::getKey));

					Map<String, Object> sortedData = new LinkedHashMap<>();
					for (Map.Entry<String, Object> entry : sortedEntries) {
						sortedData.put(entry.getKey(), entry.getValue());
					}

					documentDataList.add(sortedData);
				}
			}
			return documentDataList;
		} catch (ExecutionException | InterruptedException | CancellationException | ClassCastException
				| UnsupportedOperationException e) {
			if (e instanceof InterruptedException) {
				Thread.currentThread().interrupt();
			}
			logger.warning(e.getClass().getSimpleName() + " while fetching collection by UID: " + e.getMessage());
			return null;
		}
	}

	public void saveManualInvoice(ManualInvoice invoice) throws Exception {

		Map<String, Object> data = new HashMap<>();
		data.put("month", invoice.getMonth());
		data.put("totalAmount", invoice.getTotalAmount());
		data.put("energyCost", invoice.getEnergyCost());
		data.put("networkCost", invoice.getNetworkCost());
		data.put("surcharges", invoice.getSurcharges());
		data.put("penalties", invoice.getPenalties());
		data.put("vat", invoice.getVat());
		data.put("note", invoice.getNote());
		data.put("uploadTime", Timestamp.now());

		String[] parts = invoice.getMonth().split("-");

		db.collection(invoice.getUid())
				.document("racuni")
				.collection(parts[0])
				.document(parts[1])
				.set(data)
				.get();
	}

}
