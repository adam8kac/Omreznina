package feri.um.si.omreznina;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SuppressWarnings("removal")
@SpringBootTest(classes = { feri.um.si.omreznina.OmrezninaApplication.class,
		feri.um.si.omreznina.config.FirebaseTestConfig.class }, properties = {
				"mfa.secret.encryption-key=testniKey123456", "spring.ai.openai.api-key=dummy_test_key",
				"openweather.api.key=ffdfdsbfjdjfbdjsfbdsbfbdsjb" })
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class OmrezninaApplicationTests {

	@MockBean
	private feri.um.si.omreznina.service.FileService fileService;

	@Test
	void contextLoads() {
	}
}
