package feri.um.si.omreznina.service;
import java.time.LocalTime;
import java.util.*;
import org.springframework.stereotype.Service;


@Service
public class SimulationOfExpensesService {
//
//    public enum Season { VISJA, NIZJA }
//    public enum DayType { DELOVNI_DAN, DELA_PROST_DAN }

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

    public List<String> getAvailableDevices() {
        return new ArrayList<>(predefinedDevices.keySet());
    }

    public Map<String, Object> simulate(List<String> selectedDeviceNames, Map<Integer, Integer> agreedPowers,
                                        Season season, DayType dayType) {
        List<Device> selectedDevices = new ArrayList<>();
        for (String name : selectedDeviceNames) {
            Device device = predefinedDevices.get(name);
            if (device != null) selectedDevices.add(device);
        }

        int currentBlock = getCurrentTimeBlock(LocalTime.now(), season, dayType);
        int agreed = agreedPowers.getOrDefault(currentBlock, 0);

        int total = selectedDevices.stream()
                .filter(d -> !d.isExceptional)
                .mapToInt(d -> d.powerW)
                .sum();

        List<String> exceptional = new ArrayList<>();
        selectedDevices.stream()
                .filter(d -> d.isExceptional)
                .forEach(d -> exceptional.add(d.name + " (" + d.powerW + "W)"));

        Map<String, Object> result = new HashMap<>();
        result.put("currentBlock", currentBlock);
        result.put("agreedPower", agreed);
        result.put("totalUsedPower", total);
        result.put("status", total > agreed ? "PREKORAČITEV" : "V REDU");
        result.put("exceptionalDevices", exceptional);

        return result;
    }

    private boolean isIn(LocalTime now, String start, String end) {
        LocalTime s = LocalTime.parse(start);
        LocalTime e = LocalTime.parse(end);
        return !now.isBefore(s) && now.isBefore(e);
    }

    private int getCurrentTimeBlock(LocalTime now, Season season, DayType dayType) {
        if (isIn(now, "07:00", "14:00") || isIn(now, "16:00", "20:00")) return 1;
        if (isIn(now, "06:00", "07:00") || isIn(now, "14:00", "16:00") || isIn(now, "20:00", "22:00")) return 2;
        if (isIn(now, "00:00", "06:00")) return 3;
        if (isIn(now, "22:00", "00:00")) return 4;
        return 5;
    }
}
