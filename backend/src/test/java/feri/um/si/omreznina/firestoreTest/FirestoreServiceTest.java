package feri.um.si.omreznina.firestoreTest;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.WriteResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import feri.um.si.omreznina.service.FirestoreService;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

@SuppressWarnings("unchecked")
public class FirestoreServiceTest {

    @Mock
    private Firestore db;

    @InjectMocks
    private FirestoreService firestoreService;

    @BeforeEach
    void setUp() {
        db = mock(Firestore.class);
        firestoreService = new FirestoreService(db);
    }

    @Test
    void saveDocToCollectiob() throws Exception {
        Firestore mockDb = mock(Firestore.class);
        CollectionReference mockCollection = mock(CollectionReference.class);
        DocumentReference mockDoc = mock(DocumentReference.class);
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

    @Test
    void testGetDatabaseName() {
        CollectionReference col1 = mock(CollectionReference.class);
        CollectionReference col2 = mock(CollectionReference.class);
        when(col1.getId()).thenReturn("users");
        when(col2.getId()).thenReturn("logs");

        Iterable<CollectionReference> iterable = List.of(col1, col2);
        when(db.listCollections()).thenReturn(iterable);

        List<String> result = firestoreService.getDatabaseName();

        assertEquals(2, result.size());
        assertTrue(result.contains("users"));
        assertTrue(result.contains("logs"));
    }

    @Test
    void testGetAllCollections() {
        CollectionReference col1 = mock(CollectionReference.class);
        CollectionReference col2 = mock(CollectionReference.class);
        when(col1.getId()).thenReturn("col1");
        when(col2.getId()).thenReturn("col2");

        Iterable<CollectionReference> iterable = List.of(col1, col2);
        when(db.listCollections()).thenReturn(iterable);

        List<String> result = firestoreService.getAllCollections();
        assertEquals(List.of("col1", "col2"), result);
    }

    @Test
    void testGetDocumentNamesByUid_success() throws Exception {
        CollectionReference colRef = mock(CollectionReference.class);
        when(db.collection("uid")).thenReturn(colRef);

        QueryDocumentSnapshot doc1 = mock(QueryDocumentSnapshot.class);
        QueryDocumentSnapshot doc2 = mock(QueryDocumentSnapshot.class);
        when(doc1.getId()).thenReturn("2025-01");
        when(doc2.getId()).thenReturn("2025-02");

        ApiFuture<QuerySnapshot> future = mock(ApiFuture.class);
        QuerySnapshot snapshot = mock(QuerySnapshot.class);

        when(colRef.get()).thenReturn(future);
        when(future.get()).thenReturn(snapshot);
        when(snapshot.getDocuments()).thenReturn(List.of(doc1, doc2));

        List<String> names = firestoreService.getDocumentNamesByUid("uid");

        assertEquals(List.of("2025-01", "2025-02"), names);
    }

    @Test
    void testGetAllDataFromDocument_success() throws Exception {
        CollectionReference colRef = mock(CollectionReference.class);
        when(db.collection("uid")).thenReturn(colRef);

        QueryDocumentSnapshot doc1 = mock(QueryDocumentSnapshot.class);
        Map<String, Object> mockData = Map.of(
                "2025-01-01", Map.of("a", 1),
                "2025-01-02", Map.of("b", 2));

        when(doc1.getId()).thenReturn("2025-01");
        when(doc1.getData()).thenReturn(mockData);

        ApiFuture<QuerySnapshot> future = mock(ApiFuture.class);
        QuerySnapshot snapshot = mock(QuerySnapshot.class);

        when(colRef.get()).thenReturn(future);
        when(future.get()).thenReturn(snapshot);
        when(snapshot.getDocuments()).thenReturn(List.of(doc1));

        List<Map<String, Object>> result = firestoreService.getAllDataFromDocument("uid", "2025-01");

        assertEquals(1, result.size());
        assertTrue(result.get(0).containsKey("2025-01-01"));
        assertTrue(result.get(0).containsKey("2025-01-02"));
    }

}
