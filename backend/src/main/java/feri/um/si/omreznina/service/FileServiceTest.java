package feri.um.si.omreznina.service;

import java.net.UnknownHostException;

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

    public String makePythonCall() throws Exception {
        String url = "https://omreznina-parser-latest.onrender.com/file-to-json";
        return restTemplate.getForObject(url, String.class);
    }
}
