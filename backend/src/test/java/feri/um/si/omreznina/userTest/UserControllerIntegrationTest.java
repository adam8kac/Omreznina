package feri.um.si.omreznina.userTest;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

import feri.um.si.omreznina.OmrezninaApplication;
import feri.um.si.omreznina.config.FirebaseTestConfig;
import feri.um.si.omreznina.model.User;
import feri.um.si.omreznina.repository.UserRepository;

@SpringBootTest(classes = { OmrezninaApplication.class, FirebaseTestConfig.class })
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class UserControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        private final ObjectMapper objectMapper = new ObjectMapper();

        @MockitoBean
        private BCryptPasswordEncoder encoder;

        @MockitoBean
        private UserRepository userRepository;

        @Test
        void testUserUpdate_success() throws Exception {
                User user = new User();
                user.setId(1);
                user.setEmail("test@email.com");
                user.setPassword("password");
                user.setFirstName("Test");
                user.setLastName("User");

                Mockito.when(userRepository.findById(1))
                                .thenReturn(Optional.of(user));

                mockMvc.perform(MockMvcRequestBuilders.put("/user/update")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(user)))
                                .andExpect(status().isCreated())
                                .andExpect(content().string("User updated"));
        }

        @Test
        void testUserUpdate_fail() throws Exception {
                User user = new User();
                user.setEmail("test@email.com");
                user.setPassword("pass");
                user.setFirstName("Name");
                user.setLastName("Surname");

                mockMvc.perform(MockMvcRequestBuilders.put("/user/update")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(user)))
                                .andExpect(status().isBadRequest())
                                .andExpect(content().string("Could not update null!"));
        }

        @Test
        void testUserRegistration_Successful() throws Exception {
                User user = new User();
                user.setEmail("test@email.com");
                user.setPassword("pass123");
                user.setFirstName("Janez");
                user.setLastName("Novak");

                Mockito.when(userRepository.findByEmail("test@email.com"))
                                .thenReturn(Optional.empty());

                Mockito.when(userRepository.save(Mockito.any(User.class)))
                                .thenReturn(user);

                mockMvc.perform(MockMvcRequestBuilders.post("/user/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(user)))
                                .andExpect(status().isCreated())
                                .andExpect(content().string("User created"));
        }

        @Test
        void testUserRegistration_Fail() throws Exception {
                User existingUser = new User();
                existingUser.setEmail("test@email.com");

                User user = new User();
                user.setEmail("test@email.com");
                user.setPassword("pass123");
                user.setFirstName("Janez");
                user.setLastName("Novak");

                Mockito.when(userRepository.findByEmail("test@email.com"))
                                .thenReturn(Optional.of(existingUser));

                Mockito.when(userRepository.save(Mockito.any(User.class)))
                                .thenReturn(user);

                mockMvc.perform(MockMvcRequestBuilders.post("/user/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(user)))
                                .andExpect(status().isBadRequest())
                                .andExpect(content().string("Invalid user"));
        }

}
