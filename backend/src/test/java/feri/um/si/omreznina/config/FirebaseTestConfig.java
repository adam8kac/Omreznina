package feri.um.si.omreznina.config;

import com.google.cloud.firestore.Firestore;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class FirebaseTestConfig {

    @Bean
    public Firestore firestore() {
        return Mockito.mock(Firestore.class);
    }
}
