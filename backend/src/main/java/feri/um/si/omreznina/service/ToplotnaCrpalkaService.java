package feri.um.si.omreznina.service;

import java.util.Map;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import feri.um.si.omreznina.exceptions.UserException;
import jakarta.servlet.http.HttpServletRequest;

@Service
@SuppressWarnings("unchecked")
public class ToplotnaCrpalkaService {

    @Autowired
    private FirestoreService firestoreService;

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private UserService userService;

    private Logger logger = Logger.getLogger(getClass().getName());

    public double getCurrentWorkingPower(HttpServletRequest request, String uid) throws UserException {
        if (uid == null || uid.isEmpty()) {
            throw new UserException("uid is null or does not exist");
        }

        double turnOnTemp = getToplotnaWorkingTemp(uid);
        double currentTemp = getCurrentTemp(request);
        logger.info("toplotna temp: " + turnOnTemp + " current temp: " + currentTemp);
        if (turnOnTemp >= currentTemp) {
            return getToplotnaPower(uid);
        }

        return 0;
    }

    private double getToplotnaPower(String uid) throws UserException {
        if (uid == null || uid.isEmpty()) {
            throw new UserException("uid is null or does not exist");
        }
        try {
            double power = (Double) firestoreService.getDocumentData(uid, "toplotna-crpalka", null, null).get("power");
            return power;
        } catch (Exception e) {
            logger.warning("Could not return power");
            return 0;
        }
    }

    private double getToplotnaWorkingTemp(String uid) throws UserException {
        if (uid == null || uid.isEmpty()) {
            throw new UserException("uid is null or does not exist");
        }

        try {
            double temparature = (Double) firestoreService.getDocumentData(uid, "toplotna-crpalka", null, null)
                    .get("turn on temparature");
            return temparature;
        } catch (Exception e) {
            logger.warning("Could not return temparature");
            return 0;
        }
    }

    private double getCurrentTemp(HttpServletRequest request) {
        Map<String, Double> clientLocation = userService.getClientLocation(request);
        Object weatherInfo = weatherService.getWeatherInfo(clientLocation.get("latitude"),
                clientLocation.get("longitude"));

        if (weatherInfo instanceof Map) {
            Object tempObj = ((Map<String, Double>) weatherInfo).get("temp");

            if (tempObj != null) {
                return ((Double) tempObj).doubleValue();
            }
        }
        return 0;
    }
}
