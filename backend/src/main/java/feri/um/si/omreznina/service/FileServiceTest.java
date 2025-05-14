package feri.um.si.omreznina.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

// gre v userja
@Service
public class FileServiceTest {

    @Autowired
    private final RestTemplate restTemplate;

    public FileServiceTest(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String makePythonCall() {
        String url = "http://127.0.0.1:12345/file-to-json";
        return restTemplate.getForObject(url, String.class);
    }
}
