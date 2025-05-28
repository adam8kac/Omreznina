package feri.um.si.omreznina.model;

import feri.um.si.omreznina.type.TariffType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Tariff {
    private TariffType type;
    private double price;

    public Tariff(TariffType type) {
        this.type = type;
        this.price = setPrice(type);
    }

    private double setPrice(TariffType type) {
        if (type == TariffType.MT) {
            return 0.09790;
        } else if (type == TariffType.VT) {
            return 0.11990;
        } else {
            return 0.10890;
        }
    }
}
