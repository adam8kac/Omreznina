package feri.um.si.omreznina.service;

import java.io.File;
import java.io.IOException;
import java.net.UnknownHostException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

// gre v userja
@Service
public class FileService {

    private final Logger logger = Logger.getLogger(getClass().getName());

    @Autowired
    private final RestTemplate restTemplate;

    public FileService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String makePythonCall() throws UnknownHostException {
        String url = "https://omreznina-parser-latest.onrender.com/file-to-json";
        // String urlTest = "http://localhost:12345/file-to-json";
        return restTemplate.getForObject(url, String.class);
    }

    public void saveFile(MultipartFile file) {
        Path currentPath = Paths.get("").toAbsolutePath();
        Path parrentPath = currentPath.getParent();
        Path parserPath = parrentPath.resolve("python_helper/" + file.getOriginalFilename());

        File newFile = new File(parserPath.toString());

        try {
            file.transferTo(newFile);
        } catch (IOException | IllegalStateException e) {
            logger.warning(e.toString());
        }
    }

    public void removeFile(MultipartFile file) {
        Path currentPath = Paths.get("").toAbsolutePath();
        Path parrentPath = currentPath.getParent();
        Path filePath = parrentPath.resolve("python_helper/" + file.getOriginalFilename());

        File fileToRemove = new File(filePath.toString());

        try {
            fileToRemove.delete();
        } catch (SecurityException e) {
            logger.warning(e.toString());
        }
    }
}
