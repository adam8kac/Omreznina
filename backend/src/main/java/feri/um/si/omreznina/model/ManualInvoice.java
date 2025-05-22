package feri.um.si.omreznina.model;

import lombok.Data;

@Data
public class ManualInvoice {
    private String uid;
    private String month;
    private double totalAmount;
    private double energyCost;
    private double networkCost;
    private double surcharges;
    private double penalties;
    private double vat;
    private String note;
}
