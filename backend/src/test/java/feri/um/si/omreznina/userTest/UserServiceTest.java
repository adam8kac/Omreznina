package feri.um.si.omreznina.userTest;

import feri.um.si.omreznina.service.FileService;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest
@SuppressWarnings("removal")
@ActiveProfiles("test")
public class UserServiceTest {

    @MockBean
    private FileService fileService;

    @MockBean
    private FirestoreService firestoreService;

    @Autowired
    private UserService userService;

    @Test
    void testProcessAndStoreFile_success() throws Exception {
        String uid = "testUser";
        String jsonResponse = """
                    [
                        {
                            "2023-01": {"a": 1},
                            "2023-02": {"b": 2}
                        }
                    ]
                """;

        MockMultipartFile multipartFile = new MockMultipartFile(
                "file", "test.json", "application/json", "irrelevant".getBytes());

        when(fileService.sendFileToParser(multipartFile)).thenReturn(jsonResponse);

        userService.processAndStoreFile(multipartFile, uid);

        verify(fileService).sendFileToParser(multipartFile);
        verify(firestoreService).saveDocumentToCollection(eq(uid), any());
    }
}
