package feri.um.si.omreznina.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.InputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@Configuration
@Profile("!test")
public class FirebaseInitializer {
    @Bean
    public Firestore firestore() {
        return com.google.firebase.cloud.FirestoreClient.getFirestore();
    }

    @PostConstruct
    public void initfirebase() throws IOException {
        List<FirebaseApp> apps = FirebaseApp.getApps();

        if (apps != null && !apps.isEmpty()) {
            for (FirebaseApp app : apps) {
                app.delete();
            }
        }

        String firebaseJson = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        InputStream serviceAccount;

        if (firebaseJson != null) {
            serviceAccount = new FileInputStream(firebaseJson);
        } else {
            serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        FirebaseApp.initializeApp(options);
    }

}
