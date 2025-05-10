package feri.um.si.omreznina;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import com.google.firebase.internal.FirebaseService;

import feri.um.si.omreznina.config.FirebaseTestConfig;

@SpringBootTest
@ActiveProfiles("test")
@Import(FirebaseTestConfig.class)
class OmrezninaApplicationTests {

	@Mock
	private FirebaseService<Object> firebaseService;

	@Test
	void contextLoads() {
	}

}
