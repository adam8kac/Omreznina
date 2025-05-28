package feri.um.si.omreznina.tariffTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import feri.um.si.omreznina.helper.HolidayChecker;
import feri.um.si.omreznina.model.Tariff;
import feri.um.si.omreznina.service.PowerService;

public class TariffServiceTest {
    private PowerService powerService;
    private HolidayChecker holidayChecker;

    @BeforeEach
    void setUp() {
        holidayChecker = mock(HolidayChecker.class);
        powerService = new PowerService(holidayChecker);
    }

    @Test
    void testGetTariff_ReturnsNonNullTariff() {
        Tariff tariff = powerService.getTariff();
        assertNotNull(tariff, "Tariff should not be null");
    }

    @Test
    void testGetPricePerHour_CorrectCalculation() {
        PowerService realService = new PowerService(holidayChecker) {
            @Override
            public Tariff getTariff() {
                Tariff t = mock(Tariff.class);
                when(t.getPrice()).thenReturn(0.15);
                return t;
            }
        };

        double result = realService.getPricePerHour(100);
        assertEquals(15.0, result, 0.0001, "Price per hour should be calculated correctly");
    }
}
