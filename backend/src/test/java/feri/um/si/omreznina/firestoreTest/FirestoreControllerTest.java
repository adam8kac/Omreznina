package feri.um.si.omreznina.firestoreTest;

import feri.um.si.omreznina.controller.FirestoreController;
import feri.um.si.omreznina.service.FirestoreService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

        mockMvc.perform(get("/documents/")) 
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("user1"))
                .andExpect(jsonPath("$[1]").value("user2"));
    }

    @Test
    void testGetDocuments_success() throws Exception {
        String uid = "user1";
        List<String> docs = List.of("2023-01", "2023-02");
        when(firestoreService.getDocumentNamesByUid(uid)).thenReturn(docs);

        mockMvc.perform(get("/documents/documents").param("uid", uid))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("2023-01"))
                .andExpect(jsonPath("$[1]").value("2023-02"));
    }

    @Test
    void testGetDocumentData_success() throws Exception {
        String uid = "user1";
        String docId = "2023-01";
        Map<String, Object> data = new HashMap<>();
        data.put("a", 1);
        List<Map<String, Object>> response = List.of(data);

        when(firestoreService.getAllDataFromDocument(uid, docId)).thenReturn(response);

        mockMvc.perform(get("/documents/data")
                .param("uid", uid)
                .param("docId", docId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].a").value(1));
    }

    @Test
    void testGetDocumentData_error() throws Exception {
        String uid = "user1";
        String docId = "2023-01";

        when(firestoreService.getAllDataFromDocument(uid, docId)).thenThrow(new RuntimeException("fail"));

        mockMvc.perform(get("/documents/data")
                .param("uid", uid)
                .param("docId", docId))
                .andExpect(status().isBadRequest());
    }
}
