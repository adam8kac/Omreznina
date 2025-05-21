package feri.um.si.omreznina.controller;

import org.springframework.web.bind.annotation.RestController;

import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.service.TimeBlockService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/timeBlock")
public class TimeBlockController {
	@Autowired
	private TimeBlockService timeBlockService;

	@GetMapping("/")
	public ResponseEntity<List<TimeBlock>> getMethodName() {
		try {
			List<TimeBlock> blocks = timeBlockService.getAllBlocks();
			return ResponseEntity.ok(blocks);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/now")
	public ResponseEntity<TimeBlock> getCurrentBlock() {
		try {
			return ResponseEntity.ok(timeBlockService.getCurrentTimeBlock());
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

}
