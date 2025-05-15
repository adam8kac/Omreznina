package feri.um.si.omreznina.fileTest;

import feri.um.si.omreznina.service.FileService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class FileServiceTest {

    private final RestTemplate mockRestTemplate = mock(RestTemplate.class);
    private final FileService fileService = new FileService(mockRestTemplate);

    @TempDir
    Path tempDir;

    @Test
    void testSaveFile_createsFile() throws IOException {
        String filename = "testfile.txt";
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file",
                filename,
                "text/plain",
                "Test content".getBytes());

        Path basePath = Paths.get("").toAbsolutePath().getParent();
        Path parserPath = basePath.resolve("python_helper/" + filename);
        Files.createDirectories(parserPath.getParent());

        Files.deleteIfExists(parserPath);

        fileService.saveFile(multipartFile);

        File savedFile = parserPath.toFile();
        assertTrue(savedFile.exists(), "Datoteka mora obstajati po klicu saveFile()");

        if (parserPath.toString().contains("python_helper")) {
            Files.deleteIfExists(parserPath);
        }

    }

    @Test
    void testRemoveFile_deletesFile() throws IOException {
        String filename = "testfile.txt";

        Path basePath = Paths.get("").toAbsolutePath().getParent();
        Path parserPath = basePath.resolve("python_helper/" + filename);
        Files.createDirectories(parserPath.getParent());
        Files.writeString(parserPath, "Test content");

        MockMultipartFile multipartFile = new MockMultipartFile(
                "file",
                filename,
                "text/plain",
                "Test content".getBytes());

        assertTrue(Files.exists(parserPath), "Datoteka mora obstajati pred brisanjem");

        fileService.removeFile(multipartFile);

        assertFalse(Files.exists(parserPath), "Datoteka mora biti izbrisana");
    }

}
