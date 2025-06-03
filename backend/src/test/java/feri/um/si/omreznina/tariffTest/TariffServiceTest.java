package feri.um.si.omreznina.tariffTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import feri.um.si.omreznina.helper.HolidayChecker;
import feri.um.si.omreznina.model.Tariff;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.PowerService;
import feri.um.si.omreznina.type.TariffType;

public class TariffServiceTest {
	private PowerService powerService;
	private HolidayChecker holidayChecker;
	private FirestoreService firestoreService;

	@BeforeEach
	void setUp() {
		holidayChecker = mock(HolidayChecker.class);
		firestoreService = mock(FirestoreService.class);
		when(firestoreService.getTariff(anyString())).thenReturn(new Tariff(TariffType.ET));
		powerService = new PowerService(holidayChecker, firestoreService);
	}

	@Test
	void testGetTariff_ReturnsNonNullTariff() {
		Tariff tariff = powerService.getTariff("test-uid");
		assertNotNull(tariff, "Tariff should not be null");
	}

	@Test
	void testGetPricePerHour_CorrectCalculation_ET() {
		double result = powerService.getPricePerHour(100, "test-uid");
		assertEquals(10.89, result, 0.0001, "Price per hour should be calculated correctly for ET");
	}
}