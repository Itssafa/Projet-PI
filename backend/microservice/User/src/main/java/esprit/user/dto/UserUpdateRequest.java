package esprit.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    private String nom;

    @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères")
    private String prenom;

    @Email(message = "L'email doit être valide")
    @Size(max = 180, message = "L'email ne doit pas dépasser 180 caractères")
    private String email;

    @Size(max = 30, message = "Le téléphone ne doit pas dépasser 30 caractères")
    private String telephone;

    @Size(max = 255, message = "L'adresse ne doit pas dépasser 255 caractères")
    private String adresse;

    // Fields for AGENCE_IMMOBILIERE
    private String nomAgence;
    private String numeroLicence;
    private String siteWeb;
    private Integer nombreEmployes;
    private String zonesCouverture;

    // Fields for CLIENT_ABONNE
    private String subscriptionType;

    // Fields for ADMINISTRATEUR
    private String adminLevel;
    private String department;
}