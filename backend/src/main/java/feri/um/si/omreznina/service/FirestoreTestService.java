package feri.um.si.omreznina.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class FirestoreTestService {
    Firestore db = FirestoreClient.getFirestore();

    public List<String> getDatabaseName() {
        List<String> collectionNames = new ArrayList<>();

        for (CollectionReference collection : db.listCollections()) {
            collectionNames.add(collection.getId());
        }
        return collectionNames;
    }

//    Pridovi document pa potem value atributa "ime"
    public List<String> getDocuments() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = db.collection("bilcic").get(); //pridobi vse dokumente v kolekciji
        QuerySnapshot querySnapshot = query.get(); // to nardi da se tu zaostavi dokelr se ne dobijo vsi podatki lahko bi ibv oneliner z zgornjo vrstico
        List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments(); //seznam posameznih dokumentov
        List<String> docList = new ArrayList<>();

        for(QueryDocumentSnapshot doc : documents) {
            docList.add(doc.getData().get("ime").toString());
        }
        return docList;
    }
}
