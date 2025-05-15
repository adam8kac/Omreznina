package feri.um.si.omreznina.helper;

import java.io.InputStream;

import org.springframework.core.io.InputStreamResource;

public class MultipartInputStreamFileResource extends InputStreamResource {
    private final String filename;

    public MultipartInputStreamFileResource(InputStream inputStream, String filename) {
        super(inputStream);
        this.filename = filename;
    }

    @Override
    public String getFilename() {
        return filename;
    }

    @Override
    public long contentLength() {
        return -1;
    }
}
