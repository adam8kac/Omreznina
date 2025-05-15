package feri.um.si.omreznina.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    // Pridobi document pa potem value atributa "ime"
    public List<String> getDocuments() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = db.collection("bilcic").get(); // pridobi vse dokumente v kolekciji
        QuerySnapshot querySnapshot = query.get(); // to nardi da se tu zaostavi dokler se ne dobijo vsi podatki lahko
                                                   // bi biv oneliner z zgornjo vrstico
        List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments(); // seznam posameznih dokumentov
        List<String> docList = new ArrayList<>();

        for (QueryDocumentSnapshot doc : documents) {
            docList.add(doc.getData().get("ime").toString());
        }
        return docList;
    }

    public UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().getUserByEmail(email);
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
}
