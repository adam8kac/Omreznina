package feri.um.si.omreznina.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
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

    public List<String> getDatabaseName() {
        List<String> collectionNames = new ArrayList<>();

        for (CollectionReference collection : db.listCollections()) {
            collectionNames.add(collection.getId());
        }
        return collectionNames;
    }

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

}
