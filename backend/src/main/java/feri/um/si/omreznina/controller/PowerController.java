package feri.um.si.omreznina.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import feri.um.si.omreznina.model.Tariff;
import feri.um.si.omreznina.service.PowerService;

@RequestMapping("/power")
@RestController
public class PowerController {

	private PowerService powerService;

	public PowerController(PowerService powerService) {
		this.powerService = powerService;
	}

	@GetMapping("/tariff")
	public ResponseEntity<Tariff> getTariff(@RequestParam String uid) {
		try {
			return ResponseEntity.ok(powerService.getTariff(uid));
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/energy-price")
	public ResponseEntity<Double> getPricePerHour(@RequestParam("consumption") double consumption,
			@RequestParam String uid) {
		try {
			return ResponseEntity.ok(powerService.getPricePerHour(consumption, uid));
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@DeleteMapping("/remove-et")
	public ResponseEntity<String> removeEtFromDb(@RequestParam String uid) {
		try {
			powerService.removeEtFromDb(uid);
			return ResponseEntity.ok("Successfuly deleted ET");
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

}
