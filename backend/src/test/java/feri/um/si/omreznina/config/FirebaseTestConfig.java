package feri.um.si.omreznina.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class FirebaseTestConfig {

    @Bean
    public com.google.cloud.firestore.Firestore firestore() {
        return org.mockito.Mockito.mock(com.google.cloud.firestore.Firestore.class);
    }

    @Bean(name = "restTemplateForOpenAI")
    public org.springframework.web.client.RestTemplate restTemplateForOpenAI() {
        return org.mockito.Mockito.mock(org.springframework.web.client.RestTemplate.class);
    }
}
