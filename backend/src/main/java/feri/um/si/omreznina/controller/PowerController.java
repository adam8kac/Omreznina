package feri.um.si.omreznina.controller;

import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<Tariff> getTariff() {
		try {
			return ResponseEntity.ok(powerService.getTariff());
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/energy-price")
	public ResponseEntity<Double> getPricePerHour(@RequestParam("consumption") double consumption) {
		try {
			return ResponseEntity.ok(powerService.getPricePerHour(consumption));
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

}
