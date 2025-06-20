package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.SimulationOfExpensesService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/simulation")
@CrossOrigin
public class SimulationOfExpensesController {

    @Autowired
    private SimulationOfExpensesService simulationService;

    @GetMapping("/available-devices")
    public List<String> getAvailableDevices() {
        return simulationService.getAvailableDevices();
    }

    @PostMapping("/simulate")
    public Map<String, Object> simulate(@RequestBody SimulationRequest request) {
        return simulationService.simulate(
                request.getSelectedDevices(),
                request.getAgreedPowers(),
                request.getSeason(),
                request.getDayType()
        );
    }

    @PostMapping("/setAgreedPowers")
    public ResponseEntity<?> setAgreedPowers(@RequestBody AgreedPowersRequest request) {
        simulationService.saveAgreedPowers(request.getUid(), request.getAgreedPowers());
        return ResponseEntity.ok("Saved agreed powers.");
    }

    @Setter
    @Getter
    public static class SimulationRequest {
        private List<String> selectedDevices;
        private Map<Integer, Integer> agreedPowers;
        private SimulationOfExpensesService.Season season;
        private SimulationOfExpensesService.DayType dayType;

    }

    @Setter
    @Getter
    public static class AgreedPowersRequest {
        private String uid;
        private Map<Integer, Double> agreedPowers;

    }
}
