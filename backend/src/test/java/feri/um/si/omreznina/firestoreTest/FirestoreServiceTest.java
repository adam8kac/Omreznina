package feri.um.si.omreznina.firestoreTest;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.WriteResult;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.Test;
import feri.um.si.omreznina.service.FirestoreService;

import org.springframework.test.util.ReflectionTestUtils;
import java.util.Map;

public class FirestoreServiceTest {

    @Mock
    private Firestore db;

    @InjectMocks
    private FirestoreService firestoreService;

    @Test
    void testSaveDocumentToCollection_shouldCallFirestoreCorrectly() throws Exception {
        Firestore mockDb = mock(Firestore.class);
        CollectionReference mockCollection = mock(CollectionReference.class);
        DocumentReference mockDoc = mock(DocumentReference.class);
        @SuppressWarnings("unchecked")
        ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

        when(mockDb.collection(anyString())).thenReturn(mockCollection);
        when(mockCollection.document(anyString())).thenReturn(mockDoc);
        when(mockDoc.set(any())).thenReturn(mockFuture);
        when(mockFuture.get()).thenReturn(null);

        FirestoreService firestoreService = new FirestoreService(mockDb);

        ReflectionTestUtils.setField(firestoreService, "db", mockDb);

        Map<String, Object> doc = Map.of(
                "2023-03", Map.of("key1", 100));

        firestoreService.saveDocumentToCollection("uid", doc);

        verify(mockDb.collection("uid")).document("2023-03");
    }
}
