package feri.um.si.omreznina.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import feri.um.si.omreznina.service.ToplotnaCrpalkaService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/toplotna")
public class ToplotnaCrpalkaController {

    @Autowired
    private ToplotnaCrpalkaService toplotnaCrpalkaService;

    @GetMapping("/get-current-working-power")
    public ResponseEntity<Double> getToplotnaPower(HttpServletRequest request, @RequestParam String uid) {
        try {
            return ResponseEntity.ok(toplotnaCrpalkaService.getCurrentWorkingPower(request, uid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
