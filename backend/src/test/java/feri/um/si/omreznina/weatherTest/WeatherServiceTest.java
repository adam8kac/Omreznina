package feri.um.si.omreznina.weatherTest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import feri.um.si.omreznina.service.WeatherService;

@SpringBootTest(
    classes = {WeatherService.class}, 
    properties = {"openweather.api.key=dummyKey"})
@ActiveProfiles("test")
@SuppressWarnings({"removal", "unchecked"})
public class WeatherServiceTest {

    @Autowired
    private WeatherService weatherService;

    @MockBean
    private RestTemplate restTemplate;

    @Test
    void testGetWeatherInfo_returnsTemperature() {
        double lat = 46.05;
        double lon = 14.50;
        String expectedUrl = "https://api.openweathermap.org/data/2.5/weather?lat=46.05&lon=14.5&appid=dummyKey&units=metric";

        Map<String, Object> main = new HashMap<>();
        main.put("temp", 25.0);
        main.put("feels_like", 24.2);
        Map<String, Object> response = new HashMap<>();
        response.put("main", main);

        when(restTemplate.getForObject(eq(expectedUrl), eq(Map.class))).thenReturn(response);

        Object result = weatherService.getWeatherInfo(lat, lon);

        assertNotNull(result);
        assertTrue(result instanceof Map);
        Map<String, Object> resultMap = (Map<String, Object>) result;
        assertEquals(25.0, resultMap.get("temp"));
        assertEquals(24.2, resultMap.get("feels_like"));
    }
}
