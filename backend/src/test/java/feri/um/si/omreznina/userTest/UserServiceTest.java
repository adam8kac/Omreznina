package feri.um.si.omreznina.userTest;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.repository.UserRepository;
import feri.um.si.omreznina.service.FileService;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest
@SuppressWarnings("removal")
public class UserServiceTest {

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private BCryptPasswordEncoder encoder;

    @MockBean
    private FileService fileService;

    @MockBean
    private FirestoreService firestoreService;

    @Autowired
    private UserService userService;

    @Test
    public void testRegister_userAlreadyExists() {
        User user = new User();
        user.setEmail("test@email.com");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(user));

        UserException exception = assertThrows(UserException.class, () -> {
            userService.register(user);
        });

        assertEquals("Invalid user", exception.getMessage());
    }

    @Test
    public void testRegister_successful() throws UserException {
        User user = new User();
        user.setEmail("test@email.com");
        user.setPassword("password");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.empty());
        when(encoder.encode("password")).thenReturn("hashedPassword");

        userService.register(user);

        assertEquals("hashedPassword", user.getPassword());
        verify(userRepository).save(user);
    }

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

        when(fileService.makePythonCall()).thenReturn(jsonResponse);

        userService.processAndStoreFile(multipartFile, uid);

        verify(fileService).saveFile(multipartFile);
        verify(fileService).makePythonCall();
        verify(fileService).removeFile(multipartFile);
        verify(firestoreService).saveDocumentToCollection(eq(uid), any());
    }
}
