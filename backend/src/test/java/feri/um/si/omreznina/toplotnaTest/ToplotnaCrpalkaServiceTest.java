package feri.um.si.omreznina.toplotnaTest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import feri.um.si.omreznina.exceptions.UserException;
import feri.um.si.omreznina.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Map;

class ToplotnaCrpalkaServiceTest {

    @Mock
    private FirestoreService firestoreService;

    @Mock
    private WeatherService weatherService;

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private ToplotnaCrpalkaService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getCurrentWorkingPower_shouldThrowUserException_whenUidInvalid() {
        assertThrows(UserException.class, () -> service.getCurrentWorkingPower(request, null));
        assertThrows(UserException.class, () -> service.getCurrentWorkingPower(request, ""));
    }

    @Test
    void getCurrentWorkingPower_shouldReturnPower_whenTurnOnTempGreaterThanCurrentTemp() throws Exception {
        String uid = "user1";
        Map<String, Object> firestoreData = Map.of(
                "power", 3.5,
                "turn on temparature", 18.0);

        Map<String, Double> location = Map.of("latitude", 46.0, "longitude", 15.0);
        Map<String, Double> weather = Map.of("temp", 10.0);

        when(firestoreService.getDocumentData(uid, "toplotna-crpalka", null, null)).thenReturn(firestoreData);
        when(userService.getClientLocation(request)).thenReturn(location);
        when(weatherService.getWeatherInfo(46.0, 15.0)).thenReturn(weather);

        double result = service.getCurrentWorkingPower(request, uid);
        assertEquals(3.5, result);
    }

    @Test
    void getCurrentWorkingPower_shouldReturnZero_whenTurnOnTempLessThanCurrentTemp() throws Exception {
        String uid = "user1";
        Map<String, Object> firestoreData = Map.of(
                "power", 3.5,
                "turn on temparature", 10.0);

        Map<String, Double> location = Map.of("latitude", 46.0, "longitude", 15.0);
        Map<String, Double> weather = Map.of("temp", 18.0);

        when(firestoreService.getDocumentData(uid, "toplotna-crpalka", null, null)).thenReturn(firestoreData);
        when(userService.getClientLocation(request)).thenReturn(location);
        when(weatherService.getWeatherInfo(46.0, 15.0)).thenReturn(weather);

        double result = service.getCurrentWorkingPower(request, uid);
        assertEquals(0.0, result);
    }

    @Test
    void getCurrentWorkingPower_shouldReturnZero_whenDataMissing() throws Exception {
        String uid = "user1";
        Map<String, Object> firestoreData = Map.of(); 

        Map<String, Double> location = Map.of("latitude", 46.0, "longitude", 15.0);
        Map<String, Double> weather = Map.of("temp", 5.0);

        when(firestoreService.getDocumentData(uid, "toplotna-crpalka", null, null)).thenReturn(firestoreData);
        when(userService.getClientLocation(request)).thenReturn(location);
        when(weatherService.getWeatherInfo(46.0, 15.0)).thenReturn(weather);

        double result = service.getCurrentWorkingPower(request, uid);
        assertEquals(0.0, result);
    }
}
