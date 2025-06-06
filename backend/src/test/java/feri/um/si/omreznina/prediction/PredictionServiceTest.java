package feri.um.si.omreznina.prediction;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.service.PredictionService;
import feri.um.si.omreznina.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PredictionServiceTest {

    @InjectMocks
    private PredictionService predictionService;

    @Mock
    private UserService userService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Configure the mock RestTemplate with a more specific matcher for the target URL
        when(restTemplate.postForObject(
            eq("http://localhost:8000/detailed_stats"), 
            any(), 
            eq(Object.class))
        ).thenReturn("MOCKED_RESPONSE");
    }

    @Test
    void testSuccess() throws UserException {
        when(userService.getClientLocation(request)).thenReturn(Map.of("lat", 1.0, "lon", 2.0));
        Map<String, Object> monthMap = Map.of("a", 1);
        Map<String, Object> yearMap = Map.of("06", monthMap);
        Map<String, Object> prekor = Map.of("2024", yearMap);
        when(userService.getUserDataForML("u", request)).thenReturn(Map.of("prekoracitve", prekor));
        // Optionally, you can override the mock specifically for this test
        when(restTemplate.postForObject(anyString(), any(), eq(Object.class))).thenReturn("OK");

        Object result = predictionService.getMonthlyOverrunPrediction("u", "2025", "06", request);
        assertEquals("OK", result);
    }

    @Test
    void testNoData() throws UserException {
        when(userService.getClientLocation(request)).thenReturn(null);
        Map<String, Object> map = new HashMap<>();
        map.put("prekoracitve", null);
        when(userService.getUserDataForML("u", request)).thenReturn(map);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                predictionService.getMonthlyOverrunPrediction("u", "2025", "06", request)
        );
        assertEquals("Ni podatkov o prekorčitvah.", ex.getMessage());
    }

    @Test
    void testUserException() throws UserException {
        when(userService.getClientLocation(request)).thenReturn(null);
        when(userService.getUserDataForML("u", request)).thenThrow(new UserException("no user"));

        UserException ex = assertThrows(UserException.class, () ->
                predictionService.getMonthlyOverrunPrediction("u", "2025", "06", request)
        );
        assertEquals("no user", ex.getMessage());
    }
}