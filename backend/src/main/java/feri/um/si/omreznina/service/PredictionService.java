package feri.um.si.omreznina.service;

import feri.um.si.omreznina.exceptions.UserException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unchecked")
@Service
public class PredictionService {

    @Autowired
    private UserService userService;

    @Autowired
    private RestTemplate restTemplate;

    public Object getMonthlyOverrunPrediction(String uid, String predictionYear, String predictionMonth,
            HttpServletRequest request) throws UserException {
        Map<String, Double> location = userService.getClientLocation(request);
        double lat = (location != null && location.get("latitude") != null) ? location.get("latitude") : 46.0569;
        double lon = (location != null && location.get("longitude") != null) ? location.get("longitude") : 14.5058;

        Map<String, Object> dataForML = userService.getUserDataForML(uid, request);

        Map<String, Object> allYears = (Map<String, Object>) dataForML.get("prekoracitve");
        if (allYears == null || allYears.isEmpty()) {
            throw new IllegalArgumentException("Ni podatkov o prekorčitvah.");
        }

        int refYear = Integer.parseInt(predictionYear) - 1;
        String refYearStr = Integer.toString(refYear);

        Map<String, Object> yearMap = (Map<String, Object>) allYears.get(refYearStr);
        if (yearMap == null) {
            throw new IllegalArgumentException(
                    "Ni podatkov za izbran mesec (" + refYearStr + "-" + predictionMonth + ")!");
        }

        Map<String, Object> monthMap = (Map<String, Object>) yearMap.get(predictionMonth);
        if (monthMap == null) {
            throw new IllegalArgumentException(
                    "Ni podatkov za izbran mesec (" + refYearStr + "-" + predictionMonth + ")!");
        }

        Map<String, Object> pythonReq = new HashMap<>();
        pythonReq.put("lat", lat);
        pythonReq.put("lon", lon);
        pythonReq.put("year", refYearStr);
        pythonReq.put("month", predictionMonth);
        pythonReq.put("data", monthMap);

        String pythonUrl = "https://predikcija-prekoracitev.onrender.com/detailed_stats";
        return restTemplate.postForObject(pythonUrl, pythonReq, Object.class);
    }
}
