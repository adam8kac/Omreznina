package feri.um.si.omreznina.timeblockTest;

import feri.um.si.omreznina.controller.TimeBlockController;
import feri.um.si.omreznina.model.TimeBlock;
import feri.um.si.omreznina.model.TimeRange;
import feri.um.si.omreznina.service.TimeBlockService;
import feri.um.si.omreznina.type.SeasonType;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TimeBlockController.class)
@AutoConfigureMockMvc(addFilters = false)
@SuppressWarnings("removal")
public class TimeBlockControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private TimeBlockService timeBlockService;

	@Test
	public void shouldReturnAllTimeBlocks() throws Exception {
		TimeBlock block = new TimeBlock(null, null, 1, List.of());
		when(timeBlockService.getAllBlocks()).thenReturn(List.of(block));

		mockMvc.perform(get("/timeBlock/")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1));
	}

	@Test
	@WithMockUser
	public void shouldReturnCurrentTimeBlock() throws Exception {
		TimeRange range = new TimeRange("07:00", "14:00");
		TimeBlock expected = new TimeBlock(SeasonType.HIGH, feri.um.si.omreznina.type.DayType.WORKDAY, 1,
				List.of(range));

		when(timeBlockService.getCurrentTimeBlock()).thenReturn(expected);

		mockMvc.perform(get("/timeBlock/now")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.seasonType").value("HIGH"))
				.andExpect(jsonPath("$.dayType").value("WORKDAY"))
				.andExpect(jsonPath("$.blockNumber").value(1))
				.andExpect(jsonPath("$.timeRanges[0].from").value("07:00:00"))
				.andExpect(jsonPath("$.timeRanges[0].to").value("14:00:00"));
	}

	@Test
	@WithMockUser
	public void shouldReturnCustomTimeBlock() throws Exception {
		String dateTimeString = "2024-12-25 10:00";
		TimeRange range = new TimeRange("07:00", "14:00");
		TimeBlock expected = new TimeBlock(
				feri.um.si.omreznina.type.SeasonType.HIGH,
				feri.um.si.omreznina.type.DayType.WEEKEND,
				2,
				List.of(range));

		when(timeBlockService.getCustomTimeBlock(dateTimeString)).thenReturn(expected);

		mockMvc.perform(get("/timeBlock/custom-block")
				.param("dateTimeString", dateTimeString)
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.seasonType").value("HIGH"))
				.andExpect(jsonPath("$.dayType").value("WEEKEND"))
				.andExpect(jsonPath("$.blockNumber").value(2))
				.andExpect(jsonPath("$.timeRanges[0].from").value("07:00:00"))
				.andExpect(jsonPath("$.timeRanges[0].to").value("14:00:00"));
	}

	@Test
	@WithMockUser
	public void shouldReturnNumberAndPrice() throws Exception {
		String dateTimeString = "2024-12-25 10:00";

		Map<String, Object> mockResult = new java.util.HashMap<>();
		mockResult.put("blockNumber", 2);
		mockResult.put("price", 3.42250);

		when(timeBlockService.getNumberAndPrice(dateTimeString)).thenReturn(mockResult);

		mockMvc.perform(get("/timeBlock/price-and-block")
				.param("dateTimeString", dateTimeString)
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.blockNumber").value(2))
				.andExpect(jsonPath("$.price").value(3.4225));
	}

}
