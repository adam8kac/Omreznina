package feri.um.si.omreznina.config;

import com.google.cloud.firestore.Firestore;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@TestConfiguration
public class FirebaseTestConfig {

    @Bean
    public Firestore firestore() {
        return Mockito.mock(Firestore.class);
    }

    @Bean(name = "restTemplateForOpenAI")
    public RestTemplate restTemplateForOpenAI() {
        return Mockito.mock(RestTemplate.class);
    }
}
