package feri.um.si.omreznina.powerTest;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import feri.um.si.omreznina.service.FirestoreService;
import feri.um.si.omreznina.service.PowerService;
import feri.um.si.omreznina.helper.HolidayChecker;

public class PowerServiceTest {
	@Test
	void testRemoveEtFromDb_callsRemoveDocument() {
		FirestoreService firestoreService = mock(FirestoreService.class);
		HolidayChecker holidayChecker = mock(HolidayChecker.class);

		PowerService service = new PowerService(holidayChecker, firestoreService);

		String testUid = "test-user";
		service.removeEtFromDb(testUid);

		verify(firestoreService).removeDocument(testUid, "et");
	}
}
