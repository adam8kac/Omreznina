package feri.um.si.omreznina.controller;

import feri.um.si.omreznina.service.SimulationOfExpensesService;
import feri.um.si.omreznina.service.SimulationOfExpensesService.DayType;
import feri.um.si.omreznina.service.SimulationOfExpensesService.Season;
import org.springframework.beans.factory.annotation.Autowired;
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
                request.selectedDevices,
                request.agreedPowers,
                request.season,
                request.dayType
        );
    }

    public static class SimulationRequest {
        public List<String> selectedDevices;
        public Map<Integer, Integer> agreedPowers;
        public Season season;
        public DayType dayType;
    }
}
