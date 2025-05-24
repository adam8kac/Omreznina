package feri.um.si.omreznina.controller;

import org.springframework.web.bind.annotation.RestController;

import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.service.TimeBlockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/timeBlock")
@Tag(name = "Time Block", description = "Time Block actions")
public class TimeBlockController {
	@Autowired
	private TimeBlockService timeBlockService;

	@GetMapping("/")
	@Operation(summary = "Pridobi vse časovne bloke.")
	public ResponseEntity<List<TimeBlock>> getAllBlocks() {
		try {
			List<TimeBlock> blocks = timeBlockService.getAllBlocks();
			return ResponseEntity.ok(blocks);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/now")
	@Operation(summary = "Pridobi samo trenutni časovni blok v katerem se trenutno nahajamo.")
	public ResponseEntity<TimeBlock> getCurrentBlock() {
		try {
			return ResponseEntity.ok(timeBlockService.getCurrentTimeBlock());
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

}
