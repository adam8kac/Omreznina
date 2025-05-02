package feri.um.si.omreznina.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@Configuration
public class FirebaseInitializer {

    @PostConstruct
    public void initfirebase() throws IOException {
        List<FirebaseApp> apps = FirebaseApp.getApps();

        if (apps == null || apps.isEmpty()) {
            FileInputStream serviceAccount =
                    new FileInputStream("src/main/resources/serviceAccountKey.json");

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
        } else {
            System.out.println("Found " + apps.getFirst() + " Firebase apps");
        }

    }
}
