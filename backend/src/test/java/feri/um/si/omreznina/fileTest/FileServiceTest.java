package feri.um.si.omreznina.fileTest;

import feri.um.si.omreznina.service.FileService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class FileServiceTest {

    @Test
    void testSendFileToParser_success() throws IOException {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        FileService fileService = new FileService(mockRestTemplate);

        MockMultipartFile multipartFile = new MockMultipartFile(
                "file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "data".getBytes());

        String mockResponse = "[{\"2023-01\":{\"a\":1}}]";

        when(mockRestTemplate.postForObject(
                anyString(),
                any(HttpEntity.class),
                eq(String.class))).thenReturn(mockResponse);

        String response = fileService.sendFileToParser(multipartFile);

        assertEquals(mockResponse, response);
        verify(mockRestTemplate, times(1)).postForObject(anyString(), any(HttpEntity.class), eq(String.class));
    }

}
