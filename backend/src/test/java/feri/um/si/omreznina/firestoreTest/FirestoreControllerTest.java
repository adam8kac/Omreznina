package feri.um.si.omreznina.firestoreTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import feri.um.si.omreznina.controller.FirestoreController;
import feri.um.si.omreznina.model.ManualInvoice;
import feri.um.si.omreznina.service.FirestoreService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FirestoreController.class)
@SuppressWarnings("removal")
@AutoConfigureMockMvc(addFilters = false)
public class FirestoreControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private FirestoreService firestoreService;

	@Test
	void testGetAllCollections_success() throws Exception {
		List<String> collections = List.of("user1", "user2");
		when(firestoreService.getAllCollections()).thenReturn(collections);

		mockMvc.perform(get("/firestore/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0]").value("user1"))
				.andExpect(jsonPath("$[1]").value("user2"));
	}

	@Test
	void testGetDocumentData_success() throws Exception {
		String uid = "user1";
		String docId = "2023-01";
		Map<String, Object> data = new HashMap<>();
		data.put("a", 1);

		when(firestoreService.getDocumentData(uid, docId, null, null)).thenReturn(data);

		mockMvc.perform(get("/firestore/data")
				.param("uid", uid)
				.param("docId", docId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.a").value(1));
	}

	@Test
	void testGetDocumentData_error() throws Exception {
		String uid = "user1";
		String docId = "2023-01";

		when(firestoreService.getDocumentData(uid, docId, null, null))
				.thenThrow(new RuntimeException("fail"));

		mockMvc.perform(get("/firestore/data")
				.param("uid", uid)
				.param("docId", docId))
				.andExpect(status().isBadRequest());
	}

	void testGetSubcollections_success() throws Exception {
		String uid = "user1";
		String docId = "poraba";
		List<String> subcols = List.of("2024", "2025");

		when(firestoreService.getSubcollections(uid, docId)).thenReturn(subcols);

		mockMvc.perform(get("/firestore/subCollections")
				.param("uid", uid)
				.param("docId", docId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0]").value("2024"))
				.andExpect(jsonPath("$[1]").value("2025"));
	}

	@Test
	void testGetSubcollections_notFound() throws Exception {
		String uid = "user1";
		String docId = "poraba";

		when(firestoreService.getSubcollections(uid, docId)).thenReturn(null);

		mockMvc.perform(get("/firestore/subCollections")
				.param("uid", uid)
				.param("docId", docId))
				.andExpect(status().isNotFound());
	}

	@Test
	void testGetSubcollectionDocumentIds_success() throws Exception {
		String uid = "user1";
		String parentDocId = "poraba";
		String subcollectionId = "2024";
		List<String> docs = List.of("01", "02");

		when(firestoreService.getDocumentNamesInSubcollection(uid, parentDocId, subcollectionId)).thenReturn(docs);

		mockMvc.perform(get("/firestore/docsInSubCol")
				.param("uid", uid)
				.param("parentDocId", parentDocId)
				.param("subcollectionId", subcollectionId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0]").value("01"))
				.andExpect(jsonPath("$[1]").value("02"));
	}

	@Test
	void testGetSubcollectionDocumentIds_notFound() throws Exception {
		String uid = "user1";
		String parentDocId = "poraba";
		String subcollectionId = "2024";

		when(firestoreService.getDocumentNamesInSubcollection(uid, parentDocId, subcollectionId)).thenReturn(null);

		mockMvc.perform(get("/firestore/docsInSubCol")
				.param("uid", uid)
				.param("parentDocId", parentDocId)
				.param("subcollectionId", subcollectionId))
				.andExpect(status().isNotFound());
	}

	void manualInvoiceEndpoint_works() throws Exception {
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

		ObjectMapper objectMapper = new ObjectMapper();
		String json = objectMapper.writeValueAsString(invoice);

		doNothing().when(firestoreService).saveManualInvoice(any());

		mockMvc.perform(post("/firestore/manual")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk());
	}

	@Test
	void manualInvoiceEndpoint_fails() throws Exception {
		ManualInvoice invoice = new ManualInvoice();
		invoice.setUid("TestUser");
		invoice.setMonth("2025-04");

		ObjectMapper objectMapper = new ObjectMapper();
		String json = objectMapper.writeValueAsString(invoice);

		doThrow(new RuntimeException("Simulated fail")).when(firestoreService).saveManualInvoice(any());

		mockMvc.perform(post("/firestore/manual")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().is5xxServerError())
				.andExpect(content().string(org.hamcrest.Matchers.containsString("Napaka")));
	}

	@Test
	void testSaveEt_success() throws Exception {
		mockMvc.perform(post("/firestore/setEt").param("uid", "mojUid"))
				.andExpect(status().isOk())
				.andExpect(content().string("Et added"));

		verify(firestoreService).saveTariff("mojUid");
	}

	@Test
	void testSaveEt_failure() throws Exception {
		doThrow(new RuntimeException("BOOM")).when(firestoreService).saveTariff(anyString());

		mockMvc.perform(post("/firestore/setEt").param("uid", "mojUid"))
				.andExpect(status().isBadRequest());

		verify(firestoreService).saveTariff("mojUid");
	}

	@Test
	void saveToplotna_shouldReturnOk() throws Exception {
		mockMvc.perform(post("/firestore/set-toplotna")
				.param("uid", "user123")
				.param("power", "3.5")
				.param("temparature", "22.5"))
				.andExpect(status().isOk());

		verify(firestoreService).saveToplotnaCrpalka("user123", 3.5, 22.5);
	}

	@Test
	void saveToplotna_shouldReturnBadRequest_onException() throws Exception {
		doThrow(new RuntimeException("error")).when(firestoreService).saveToplotnaCrpalka(anyString(), anyDouble(), anyDouble());

		mockMvc.perform(post("/firestore/set-toplotna")
				.param("uid", "user123")
				.param("power", "3.5")
				.param("temparature", "22.5"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void removeToplotna_shouldReturnOk() throws Exception {
		mockMvc.perform(delete("/firestore/remove-toplotna")
				.param("uid", "user123"))
				.andExpect(status().isOk());

		verify(firestoreService).removeDocument("user123", "toplotna-crpalka");
	}

	@Test
	void removeToplotna_shouldReturnBadRequest_onException() throws Exception {
		doThrow(new RuntimeException("error")).when(firestoreService).removeDocument(anyString(), anyString());

		mockMvc.perform(delete("/firestore/remove-toplotna")
				.param("uid", "user123"))
				.andExpect(status().isBadRequest());
	}
}
