package feri.um.si.omreznina.service;

import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import lombok.Getter;
import org.springframework.stereotype.Service;
import feri.um.si.omreznina.model.TimeBlock;

@Service
public class SimulationOfExpensesService {

    public enum Season {
        VISJA, NIZJA
    }

    public enum DayType {
        DELOVNI_DAN, DELA_PROST_DAN
    }

    @Getter
    public static class Device {
        public String name;
        public int powerW;
        public boolean isExceptional;

        public Device(String name, int powerW, boolean isExceptional) {
            this.name = name;
            this.powerW = powerW;
            this.isExceptional = isExceptional;
        }
    }

    private static final Map<String, Device> predefinedDevices = new LinkedHashMap<>();

    static {
        predefinedDevices.put("Sušilni stroj", new Device("Sušilni stroj", 4000, false));
        predefinedDevices.put("Bojler", new Device("Bojler", 3500, false));
        predefinedDevices.put("Električni štedilnik", new Device("Električni štedilnik", 3000, false));
        predefinedDevices.put("Likalnik", new Device("Likalnik", 2200, false));
        predefinedDevices.put("Pečica", new Device("Pečica", 2000, false));
        predefinedDevices.put("Fen", new Device("Fen", 1500, false));
        predefinedDevices.put("Klima", new Device("Klima", 1500, false));
        predefinedDevices.put("Pomivalni stroj", new Device("Pomivalni stroj", 1000, false));
        predefinedDevices.put("Pralni stroj", new Device("Pralni stroj", 800, false));
        predefinedDevices.put("Grelno telo", new Device("Grelno telo", 3000, false));
        predefinedDevices.put("TV", new Device("TV", 400, false));
        predefinedDevices.put("Računalnik", new Device("Računalnik", 300, false));
        predefinedDevices.put("Prenosnik", new Device("Prenosnik", 100, false));
        predefinedDevices.put("Toplotna črpalka", new Device("Toplotna črpalka", 2000, true));
    }

    private final TimeBlockService timeBlockService;

    private final FirestoreService firestoreService;

    private final Logger logger = Logger.getLogger(getClass().getName());

    public SimulationOfExpensesService(TimeBlockService timeBlockService, FirestoreService firestoreService) {
        this.timeBlockService = timeBlockService;
        this.firestoreService = firestoreService;
    }

    public void saveAgreedPowers(String uid, Map<Integer, Double> agreedPowers) {
        logger.info("Saved powers: " + agreedPowers);
        firestoreService.saveAgreedPowers(uid, agreedPowers);
    }

    public List<String> getAvailableDevices() {
        return new ArrayList<>(predefinedDevices.keySet());
    }

    public Map<String, Object> simulate(List<String> selectedDeviceNames,
            Map<Integer, Integer> agreedPowers,
            Season season,
            DayType dayType) {

        List<Device> selectedDevices = selectedDeviceNames.stream()
                .map(predefinedDevices::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        TimeBlock currentTimeBlock = timeBlockService.getCurrentTimeBlock();
        int currentBlockId = currentTimeBlock.getBlockNumber();
        double price = currentTimeBlock.getPrice();

        int agreedPower = agreedPowers.getOrDefault(currentBlockId, 0);

        int totalUsedPower = selectedDevices.stream()
                .filter(d -> !d.isExceptional)
                .mapToInt(d -> d.powerW)
                .sum();

        List<String> exceptionalDevices = selectedDevices.stream()
                .filter(Device::isExceptional)
                .map(d -> d.name + " (" + d.powerW + "W)")
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("currentBlock", currentBlockId);
        result.put("timeBlockPrice", price);
        result.put("agreedPower", agreedPower);
        result.put("totalUsedPower", totalUsedPower);
        result.put("status", totalUsedPower > agreedPower ? "PREKORAČITEV" : "V REDU");
        result.put("exceptionalDevices", exceptionalDevices);
        result.put("season", season.name());
        result.put("dayType", dayType.name());

        return result;
    }
}
