package feri.um.si.omreznina.service;

import java.io.IOException;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import feri.um.si.omreznina.helper.MultipartInputStreamFileResource;

@Service
public class FileService {

    @Autowired
    private final RestTemplate restTemplate;

    public FileService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String sendFileToParser(MultipartFile file) throws IOException {
        String url = "https://omreznina-parser-latest.onrender.com/upload-file"; 

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        return restTemplate.postForObject(url, requestEntity, String.class);
    }
}
