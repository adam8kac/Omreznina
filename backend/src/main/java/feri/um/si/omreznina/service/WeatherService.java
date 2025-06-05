package feri.um.si.omreznina.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.beans.factory.annotation.Value;

@Service
@SuppressWarnings("unchecked")
public class WeatherService {

    @Autowired
    RestTemplate restTemplate;

    @Value("${openweather.api.key}")
    private String openWeatehrApiKey;
    private String url = "https://api.openweathermap.org/data/2.5/weather?";

    public Object getWeatherInfo(double lat, double lon) {
        String newUrl = url + "lat=" + lat + "&lon=" + lon + "&appid=" + openWeatehrApiKey + "&units=metric";
        System.out.println(openWeatehrApiKey);
        Map<String, Object> response = restTemplate.getForObject(newUrl, Map.class);
        if (response == null || response.isEmpty()) {
            return null;
        }
        Object temparature = response.get("main");
        return temparature;
    }
}
