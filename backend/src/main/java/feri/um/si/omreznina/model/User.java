package feri.um.si.omreznina.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.checkerframework.checker.signature.qual.Identifier;
import org.checkerframework.common.aliasing.qual.Unique;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String firebaseUid;
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
