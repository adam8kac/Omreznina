package feri.um.si.omreznina;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import feri.um.si.omreznina.config.FirebaseTestConfig;
import feri.um.si.omreznina.service.FileService;
import feri.um.si.omreznina.service.FirestoreService;

@SuppressWarnings("removal")
@SpringBootTest(properties = { "mfa.secret.encryption-key=testniKey123456", "spring.ai.openai.api-key=dummy_test_key" })
@ActiveProfiles("test")
@Import(FirebaseTestConfig.class)
class OmrezninaApplicationTests {

	@MockBean
	private FileService fileService;

	@MockBean
	private FirestoreService firestoreService;

	@Test
	void contextLoads() {
	}

}
