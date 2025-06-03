package feri.um.si.omreznina.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MfaSettings {
    private String uid;
    private boolean enabled;
    private String secretHash;
}