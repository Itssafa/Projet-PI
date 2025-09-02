package esprit.user.dto;

import esprit.user.entity.UserStatus;
import esprit.user.entity.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private UserType userType;
    private UserStatus status;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Agency-specific fields
    private String nomAgence;
    private String numeroLicence;
    private String siteWeb;
    private Integer nombreEmployes;
    private String zonesCouverture;
    private Boolean verified;
}