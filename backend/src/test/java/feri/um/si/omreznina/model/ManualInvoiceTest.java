package feri.um.si.omreznina.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ManualInvoiceTest {

    @Test
    void testGettersAndSetters() {
        ManualInvoice invoice = new ManualInvoice();
        invoice.setUid("user123");
        invoice.setMonth("2024-12");
        invoice.setTotalAmount(99.99);
        invoice.setEnergyCost(30);
        invoice.setNetworkCost(20);
        invoice.setSurcharges(5);
        invoice.setPenalties(2);
        invoice.setVat(8.5);
        invoice.setNote("Test note");

        assertEquals("user123", invoice.getUid());
        assertEquals("2024-12", invoice.getMonth());
        assertEquals(99.99, invoice.getTotalAmount());
        assertEquals(30, invoice.getEnergyCost());
        assertEquals(20, invoice.getNetworkCost());
        assertEquals(5, invoice.getSurcharges());
        assertEquals(2, invoice.getPenalties());
        assertEquals(8.5, invoice.getVat());
        assertEquals("Test note", invoice.getNote());
    }

    @Test
    void testEqualsAndHashCode() {
        ManualInvoice invoice1 = new ManualInvoice();
        invoice1.setUid("abc");
        invoice1.setMonth("2023-05");

        ManualInvoice invoice2 = new ManualInvoice();
        invoice2.setUid("abc");
        invoice2.setMonth("2023-05");

        assertEquals(invoice1, invoice2);
        assertEquals(invoice1.hashCode(), invoice2.hashCode());
    }

    @Test
    void testToString() {
        ManualInvoice invoice = new ManualInvoice();
        invoice.setUid("userTest");
        String str = invoice.toString();
        assertTrue(str.contains("userTest"));
    }
}
