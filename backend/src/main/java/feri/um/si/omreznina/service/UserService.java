package feri.um.si.omreznina.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class UserService {

    private final Logger logger = Logger.getLogger(getClass().getName());

    private FileService fileService;

    FirestoreService firestoreService;

    public UserService(FileService fileService, FirestoreService firestoreService) {
        this.fileService = fileService;
        this.firestoreService = firestoreService;
    }

    public void processAndStoreFile(MultipartFile file, String uid) {
        try {
            String response = fileService.sendFileToParser(file);

            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> parsed = mapper.readValue(response, new TypeReference<>() {
            });

            for (Map<String, Object> doc : parsed) {
                firestoreService.saveDocumentToCollection(uid, doc);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "File processing failed", e);
        }
    }

}
