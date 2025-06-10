package feri.um.si.omreznina.firestoreTest;

import com.google.cloud.firestore.*;
import com.google.api.core.ApiFuture;

import static org.junit.jupiter.api.Assertions.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.model.ManualInvoice;
import feri.um.si.omreznina.model.MfaSettings;

import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import feri.um.si.omreznina.service.FileService;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.UserService;

import org.springframework.test.context.ActiveProfiles;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@SuppressWarnings("unchecked")
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class FirestoreServiceTest {

	@Mock
	private Firestore db;

	@Mock
	private FileService fileService;

	@Spy
	@InjectMocks
	private UserService userService;

	@InjectMocks
	private FirestoreService firestoreService;

	@Test
	void saveDocToCollection() throws Exception {
		Firestore mockDb = mock(Firestore.class);
		CollectionReference mockUserCollection = mock(CollectionReference.class);
		DocumentReference mockDoc = mock(DocumentReference.class);
		CollectionReference mockYearCollection = mock(CollectionReference.class);
		DocumentReference mockMonthDoc = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		when(mockDb.collection(anyString())).thenReturn(mockUserCollection);
		when(mockUserCollection.document(anyString())).thenReturn(mockDoc);
		when(mockDoc.collection(anyString())).thenReturn(mockYearCollection);
		when(mockYearCollection.document(anyString())).thenReturn(mockMonthDoc);
		when(mockMonthDoc.set(any())).thenReturn(mockFuture);
		when(mockFuture.get()).thenReturn(null);

		FirestoreService firestoreService = new FirestoreService(mockDb);

		Map<String, Map<String, Map<String, Object>>> doc = Map.of(
				"2023", Map.of(
						"2023-03", Map.of("key1", 100)));

		firestoreService.saveDocumentToCollection("uid", "poraba", doc);

		verify(mockDb).collection("uid");
		verify(mockUserCollection).document("poraba");
		verify(mockDoc).collection("2023");
		verify(mockYearCollection).document("2023-03");
		verify(mockMonthDoc).set(Map.of("key1", 100));
	}

	@Test
	void testGetDatabaseName() {
		CollectionReference col1 = mock(CollectionReference.class);
		CollectionReference col2 = mock(CollectionReference.class);
		when(col1.getId()).thenReturn("users");
		when(col2.getId()).thenReturn("logs");

		Iterable<CollectionReference> iterable = List.of(col1, col2);
		when(db.listCollections()).thenReturn(iterable);

		List<String> result = firestoreService.getAllCollections();

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
	void testGetDocumentData_rootDocument_success() throws Exception {
		DocumentReference docRef = mock(DocumentReference.class);
		when(db.collection("uid")).thenReturn(mock(CollectionReference.class));
		when(db.collection("uid").document("2025-01")).thenReturn(docRef);

		Map<String, Object> mockData = Map.of(
				"2025-01-01", Map.of("a", 1),
				"2025-01-02", Map.of("b", 2));

		DocumentSnapshot docSnap = mock(DocumentSnapshot.class);
		when(docRef.get()).thenReturn(mock(ApiFuture.class));
		when(docRef.get().get()).thenReturn(docSnap);
		when(docSnap.exists()).thenReturn(true);
		when(docSnap.getData()).thenReturn(mockData);

		Map<String, Object> result = firestoreService.getDocumentData("uid", "2025-01", null, null);

		assertNotNull(result);
		assertTrue(result.containsKey("2025-01-01"));
		assertTrue(result.containsKey("2025-01-02"));
	}

	@Test
	void testGetDocumentData_nestedDocument_success() throws Exception {
		DocumentReference porabaDoc = mock(DocumentReference.class);
		CollectionReference yearCol = mock(CollectionReference.class);
		DocumentReference monthDoc = mock(DocumentReference.class);

		when(db.collection("uid")).thenReturn(mock(CollectionReference.class));
		when(db.collection("uid").document("poraba")).thenReturn(porabaDoc);
		when(porabaDoc.collection("2024")).thenReturn(yearCol);
		when(yearCol.document("01")).thenReturn(monthDoc);

		Map<String, Object> mockData = Map.of(
				"a", 1,
				"b", 2);

		DocumentSnapshot docSnap = mock(DocumentSnapshot.class);
		when(monthDoc.get()).thenReturn(mock(ApiFuture.class));
		when(monthDoc.get().get()).thenReturn(docSnap);
		when(docSnap.exists()).thenReturn(true);
		when(docSnap.getData()).thenReturn(mockData);

		Map<String, Object> result = firestoreService.getDocumentData("uid", "poraba", "2024", "01");

		assertNotNull(result);
		assertEquals(1, result.get("a"));
		assertEquals(2, result.get("b"));
	}

	@Test
	void testSaveSingleDocument_savesCorrectly() throws Exception {
		Firestore mockDb = mock(Firestore.class);
		CollectionReference mockCollection = mock(CollectionReference.class);
		DocumentReference mockDocRef = mock(DocumentReference.class);
		CollectionReference mockYearCollection = mock(CollectionReference.class);
		DocumentReference mockMonthDoc = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		when(mockDb.collection(anyString())).thenReturn(mockCollection);
		when(mockCollection.document(anyString())).thenReturn(mockDocRef);
		when(mockDocRef.collection(anyString())).thenReturn(mockYearCollection);
		when(mockYearCollection.document(anyString())).thenReturn(mockMonthDoc);
		when(mockMonthDoc.set(any())).thenReturn(mockFuture);
		when(mockFuture.get()).thenReturn(null);

		FirestoreService firestoreService = new FirestoreService(mockDb);

		Map<String, Map<String, Map<String, Object>>> data = Map.of(
				"2025", Map.of(
						"05", Map.of("key", "value")));

		firestoreService.saveDocumentToCollection("testUid", "docId", data);

		verify(mockDb).collection(eq("testUid"));
		verify(mockCollection).document(eq("docId"));
		verify(mockDocRef).collection(eq("2025"));
		verify(mockYearCollection).document(eq("05"));
		verify(mockMonthDoc).set(eq(Map.of("key", "value")));
		verify(mockFuture).get();
	}

	@Test
	void testGetDocumentNamesInSubcollection_success() throws Exception {
		String userId = "user1";
		String parentDocId = "poraba";
		String subcollectionId = "2024";

		CollectionReference colRef = mock(CollectionReference.class);
		DocumentReference docRef = mock(DocumentReference.class);

		when(db.collection(userId)).thenReturn(colRef);
		when(colRef.document(parentDocId)).thenReturn(docRef);

		CollectionReference subColRef = mock(CollectionReference.class);
		when(docRef.collection(subcollectionId)).thenReturn(subColRef);

		ApiFuture<QuerySnapshot> future = mock(ApiFuture.class);
		QuerySnapshot snapshot = mock(QuerySnapshot.class);

		QueryDocumentSnapshot doc1 = mock(QueryDocumentSnapshot.class);
		QueryDocumentSnapshot doc2 = mock(QueryDocumentSnapshot.class);

		when(subColRef.get()).thenReturn(future);
		when(future.get()).thenReturn(snapshot);
		when(snapshot.getDocuments()).thenReturn(List.of(doc1, doc2));

		when(doc1.getId()).thenReturn("01");
		when(doc2.getId()).thenReturn("02");

		List<String> result = firestoreService.getDocumentNamesInSubcollection(userId, parentDocId, subcollectionId);

		assertEquals(List.of("01", "02"), result);
	}

	@Test
	void testGetDocumentNamesInSubcollection_interruptedException() throws Exception {
		String userId = "user1";
		String parentDocId = "poraba";
		String subcollectionId = "2024";

		CollectionReference colRef = mock(CollectionReference.class);
		DocumentReference docRef = mock(DocumentReference.class);
		when(db.collection(userId)).thenReturn(colRef);
		when(colRef.document(parentDocId)).thenReturn(docRef);
		CollectionReference subColRef = mock(CollectionReference.class);
		when(docRef.collection(subcollectionId)).thenReturn(subColRef);

		ApiFuture<QuerySnapshot> future = mock(ApiFuture.class);
		when(subColRef.get()).thenReturn(future);
		when(future.get()).thenThrow(new InterruptedException("interrupted"));

		List<String> result = firestoreService.getDocumentNamesInSubcollection(userId, parentDocId, subcollectionId);

		assertNull(result);
	}

	@Test
	void testGetSubcollections_success() {
		String uid = "user1";
		String docId = "poraba";

		DocumentReference docRef = mock(DocumentReference.class);
		when(db.collection(uid)).thenReturn(mock(CollectionReference.class));
		when(db.collection(uid).document(docId)).thenReturn(docRef);

		CollectionReference col2024 = mock(CollectionReference.class);
		when(col2024.getId()).thenReturn("2024");
		CollectionReference col2025 = mock(CollectionReference.class);
		when(col2025.getId()).thenReturn("2025");

		Iterable<CollectionReference> subCollections = List.of(col2024, col2025);

		when(docRef.listCollections()).thenReturn(subCollections);

		List<String> result = firestoreService.getSubcollections(uid, docId);

		assertEquals(List.of("2024", "2025"), result);
	}

	@Test
	void testGetSubcollections_empty() {
		String uid = "user1";
		String docId = "poraba";

		DocumentReference docRef = mock(DocumentReference.class);
		when(db.collection(uid)).thenReturn(mock(CollectionReference.class));
		when(db.collection(uid).document(docId)).thenReturn(docRef);

		Iterable<CollectionReference> subCollections = List.of();
		when(docRef.listCollections()).thenReturn(subCollections);

		List<String> result = firestoreService.getSubcollections(uid, docId);

		assertNotNull(result);
		assertTrue(result.isEmpty());
	}

	void saveManualInvoice_savesCorrectly() throws Exception {
		Firestore db = mock(Firestore.class);
		CollectionReference colRef = mock(CollectionReference.class);
		DocumentReference docRef = mock(DocumentReference.class);
		CollectionReference yearCollection = mock(CollectionReference.class);
		DocumentReference monthDoc = mock(DocumentReference.class);
		ApiFuture<WriteResult> future = mock(ApiFuture.class);

		when(db.collection(any())).thenReturn(colRef);
		when(colRef.document("racuni")).thenReturn(docRef);
		when(docRef.collection("2025")).thenReturn(yearCollection);
		when(yearCollection.document("04")).thenReturn(monthDoc);
		when(monthDoc.set(any())).thenReturn(future);
		when(future.get()).thenReturn(null);

		FirestoreService service = new FirestoreService(db);

		ManualInvoice invoice = new ManualInvoice();
		invoice.setUid("TestUser");
		invoice.setMonth("2025-04");
		invoice.setTotalAmount(10);
		invoice.setEnergyCost(2);
		invoice.setNetworkCost(3);
		invoice.setSurcharges(1);
		invoice.setPenalties(0.5);
		invoice.setVat(2.5);
		invoice.setNote("Test opomba");

		service.saveManualInvoice(invoice);

		verify(db).collection("TestUser");
		verify(colRef).document("racuni");
		verify(docRef).collection("2025");
		verify(yearCollection).document("04");
		verify(monthDoc).set(any());
		verify(future).get();
	}

	@Test
	void saveManualInvoice_throwsException() throws Exception {
		Firestore db = mock(Firestore.class);
		CollectionReference colRef = mock(CollectionReference.class);
		DocumentReference docRef = mock(DocumentReference.class);
		CollectionReference yearCollection = mock(CollectionReference.class);
		DocumentReference monthDoc = mock(DocumentReference.class);
		ApiFuture<WriteResult> future = mock(ApiFuture.class);

		when(db.collection(any())).thenReturn(colRef);
		when(colRef.document("racuni")).thenReturn(docRef);
		when(docRef.collection(anyString())).thenReturn(yearCollection);
		when(yearCollection.document(anyString())).thenReturn(monthDoc);
		when(monthDoc.set(any())).thenReturn(future);
		when(future.get()).thenThrow(new RuntimeException("Firestore fail"));

		FirestoreService service = new FirestoreService(db);

		ManualInvoice invoice = new ManualInvoice();
		invoice.setUid("TestUser");
		invoice.setMonth("2025-04");
		invoice.setTotalAmount(10);

		Exception ex = assertThrows(Exception.class, () -> {
			service.saveManualInvoice(invoice);
		});
		assertTrue(ex.getMessage().contains("Firestore fail"));
	}

	@Test
	void testSaveTariff_savesCorrectly() throws Exception {
		Firestore mockDb = mock(Firestore.class);
		CollectionReference mockCollection = mock(CollectionReference.class);
		DocumentReference mockDocRef = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		when(mockDb.collection("someUid")).thenReturn(mockCollection);
		when(mockCollection.document("et")).thenReturn(mockDocRef);
		when(mockDocRef.set(any(Map.class))).thenReturn(mockFuture);
		when(mockFuture.get()).thenReturn(null);

		FirestoreService firestoreService = new FirestoreService(mockDb);

		firestoreService.saveTariff("someUid");

		verify(mockDb).collection("someUid");
		verify(mockCollection).document("et");
		verify(mockDocRef).set(eq(Map.of("price", 0.10890)));
		verify(mockFuture).get();
	}

	@Test
	void testSaveMfaSettings_savesCorrectly() throws Exception {
		Firestore mockDb = mock(Firestore.class);
		CollectionReference mockCollection = mock(CollectionReference.class);
		DocumentReference mockDocRef = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		MfaSettings settings = new MfaSettings();

		when(mockDb.collection("uid123")).thenReturn(mockCollection);
		when(mockCollection.document("mfa")).thenReturn(mockDocRef);
		when(mockDocRef.set(eq(settings))).thenReturn(mockFuture);
		when(mockFuture.get()).thenReturn(null);

		FirestoreService firestoreService = new FirestoreService(mockDb);

		firestoreService.saveMfaSettings("uid123", settings);

		verify(mockDb).collection("uid123");
		verify(mockCollection).document("mfa");
		verify(mockDocRef).set(eq(settings));
		verify(mockFuture).get();
	}

	@Test
	void testSaveMfaSettings_handlesException() throws Exception {
		Firestore mockDb = mock(Firestore.class);
		CollectionReference mockCollection = mock(CollectionReference.class);
		DocumentReference mockDocRef = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		when(mockDb.collection(anyString())).thenReturn(mockCollection);
		when(mockCollection.document(anyString())).thenReturn(mockDocRef);
		when(mockDocRef.set(any(MfaSettings.class))).thenReturn(mockFuture);
		when(mockFuture.get()).thenThrow(new RuntimeException("Firestore fail"));

		FirestoreService testService = new FirestoreService(mockDb);

		assertDoesNotThrow(() -> testService.saveMfaSettings("uid", new MfaSettings()));

		verify(mockDocRef).set(any(MfaSettings.class));
		verify(mockFuture).get();
	}

	@Test
	void testRemoveDocument_deletesCorrectly() {
		Firestore mockDb = mock(Firestore.class);
		CollectionReference mockCollection = mock(CollectionReference.class);
		DocumentReference mockDocRef = mock(DocumentReference.class);

		when(mockDb.collection("user123")).thenReturn(mockCollection);
		when(mockCollection.document("to-delete")).thenReturn(mockDocRef);

		FirestoreService service = new FirestoreService(mockDb);

		service.removeDocument("user123", "to-delete");

		verify(mockDb).collection("user123");
		verify(mockCollection).document("to-delete");
		verify(mockDocRef).delete();
	}

	@Test
	void saveToplotnaCrpalka_validInput_shouldSaveSuccessfully() throws Exception {
		String uid = "user1";
		double power = 3.5;
		double temp = 21.0;

		DocumentReference docRef = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		Map<String, Double> expectedMap = new LinkedHashMap<>();
		expectedMap.put("power", power);
		expectedMap.put("turn on temparature", temp);

		when(db.collection(uid)).thenReturn(mock(CollectionReference.class));
		when(db.collection(uid).document("toplotna-crpalka")).thenReturn(docRef);
		when(docRef.set(eq(expectedMap))).thenReturn(mockFuture);
		when(mockFuture.get()).thenReturn(mock(WriteResult.class));

		assertDoesNotThrow(() -> firestoreService.saveToplotnaCrpalka(uid, power, temp));
	}

	@Test
	void saveToplotnaCrpalka_invalidInput_shouldThrowUserException() {
		assertThrows(UserException.class, () -> firestoreService.saveToplotnaCrpalka(null, 3.5, 20));
		assertThrows(UserException.class, () -> firestoreService.saveToplotnaCrpalka("", 3.5, 20));
		assertThrows(UserException.class, () -> firestoreService.saveToplotnaCrpalka("user1", 0, 20));
	}

	@Test
	void saveToplotnaCrpalka_executionException_shouldNotThrow() throws Exception {
		String uid = "user1";
		double power = 3.5;
		double temp = 21.0;

		DocumentReference docRef = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		Map<String, Double> expectedMap = new LinkedHashMap<>();
		expectedMap.put("power", power);
		expectedMap.put("turn on temparature", temp);

		when(db.collection(uid)).thenReturn(mock(CollectionReference.class));
		when(db.collection(uid).document("toplotna-crpalka")).thenReturn(docRef);
		when(docRef.set(eq(expectedMap))).thenReturn(mockFuture);
		when(mockFuture.get()).thenThrow(new ExecutionException(new RuntimeException("Firestore error")));

		assertDoesNotThrow(() -> firestoreService.saveToplotnaCrpalka(uid, power, temp));
	}

	@Test
	void saveToplotnaCrpalka_interruptedException_shouldInterruptThread() throws Exception {
		String uid = "user1";
		double power = 3.5;
		double temp = 21.0;

		DocumentReference docRef = mock(DocumentReference.class);
		ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);

		Map<String, Double> expectedMap = new LinkedHashMap<>();
		expectedMap.put("power", power);
		expectedMap.put("turn on temparature", temp);

		when(db.collection(uid)).thenReturn(mock(CollectionReference.class));
		when(db.collection(uid).document("toplotna-crpalka")).thenReturn(docRef);
		when(docRef.set(eq(expectedMap))).thenReturn(mockFuture);
		when(mockFuture.get()).thenThrow(new InterruptedException());

		Thread currentThread = Thread.currentThread();
		assertFalse(currentThread.isInterrupted());

		firestoreService.saveToplotnaCrpalka(uid, power, temp);

		assertTrue(currentThread.isInterrupted());
	}

	@Test
	void testRemoveDocumentAndSubcollections() throws Exception {
		String uid = "users";
		String docId = "doc1";

		CollectionReference mockUserCol = mock(CollectionReference.class);
		DocumentReference mockDocRef = mock(DocumentReference.class);
		CollectionReference mockSubCol = mock(CollectionReference.class);
		QueryDocumentSnapshot mockSubDoc1 = mock(QueryDocumentSnapshot.class);
		QueryDocumentSnapshot mockSubDoc2 = mock(QueryDocumentSnapshot.class);
		DocumentReference mockSubDocRef1 = mock(DocumentReference.class);
		DocumentReference mockSubDocRef2 = mock(DocumentReference.class);
		ApiFuture<QuerySnapshot> mockFuture = mock(ApiFuture.class);
		QuerySnapshot mockQuerySnapshot = mock(QuerySnapshot.class);

		when(db.collection(uid)).thenReturn(mockUserCol);
		when(mockUserCol.document(docId)).thenReturn(mockDocRef);
		when(mockDocRef.listCollections()).thenReturn(List.of(mockSubCol));
		when(mockSubCol.get()).thenReturn(mockFuture);
		when(mockFuture.get()).thenReturn(mockQuerySnapshot);

		List<QueryDocumentSnapshot> docs = List.of(mockSubDoc1, mockSubDoc2);
		when(mockQuerySnapshot.getDocuments()).thenReturn(docs);

		when(mockSubDoc1.getReference()).thenReturn(mockSubDocRef1);
		when(mockSubDoc2.getReference()).thenReturn(mockSubDocRef2);

		firestoreService.removeDocumentAndSubcollections(uid, docId);

		verify(mockSubDocRef1, times(1)).delete();
		verify(mockSubDocRef2, times(1)).delete();
		verify(mockDocRef, times(1)).delete();
	}

	@Test
	void testRemoveDocumentAndSubcollectionsException() {
		String uid = "users";
		String docId = "doc1";

		CollectionReference mockUserCol = mock(CollectionReference.class);
		DocumentReference mockDocRef = mock(DocumentReference.class);

		when(db.collection(uid)).thenReturn(mockUserCol);
		when(mockUserCol.document(docId)).thenReturn(mockDocRef);
		when(mockDocRef.listCollections()).thenThrow(new RuntimeException("Testna napaka"));

		assertThrows(RuntimeException.class, () -> firestoreService.removeDocumentAndSubcollections(uid, docId));
		verify(mockDocRef, never()).delete();
	}
}
