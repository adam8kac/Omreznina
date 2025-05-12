package feri.um.si.omreznina.userTest;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.repository.UserRepository;
import feri.um.si.omreznina.service.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserServiceTest {

    private UserRepository userRepository;
    private BCryptPasswordEncoder encoder;
    private UserService userService;

    @BeforeEach
    public void setup() {
        userRepository = mock(UserRepository.class);
        encoder = mock(BCryptPasswordEncoder.class);
        userService = new UserService(userRepository, encoder);
    }

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
    public void testRegister_successful() {
        User user = new User();
        user.setEmail("test@email.com");
        user.setPassword("password");

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.empty());
        when(encoder.encode("password")).thenReturn("hashedPassword");

        try {
            userService.register(user);
        } catch (Exception e) {
            e.printStackTrace();
        }

        assertEquals("hashedPassword", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    public void testUpdateProfile_userNotFound() {
        User user = new User(); // id == null

        UserException exception = assertThrows(UserException.class, () -> {
            userService.updateProfile(user);
        });

        assertEquals("Could not update null!", exception.getMessage());
    }

@Test
public void testUpdateProfile_successful() throws Exception {
    User updatedUser = new User();
    updatedUser.setId(1);
    updatedUser.setFirstName("New");
    updatedUser.setLastName("Name");
    updatedUser.setEmail("new@email.com");

    User existingUser = new User();
    existingUser.setId(1);
    existingUser.setFirstName("Old");
    existingUser.setLastName("OldSurname");
    existingUser.setEmail("old@email.com");

    when(userRepository.findById(1)).thenReturn(Optional.of(existingUser));

    userService.updateProfile(updatedUser);

    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCaptor.capture());
    User savedUser = userCaptor.getValue();

    assertEquals("New", savedUser.getFirstName());
    assertEquals("Name", savedUser.getLastName());
    assertEquals("new@email.com", savedUser.getEmail());
}

}
