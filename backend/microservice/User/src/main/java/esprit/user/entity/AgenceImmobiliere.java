package esprit.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@DiscriminatorValue("AGENCE_IMMOBILIERE")
public class AgenceImmobiliere extends User {

    @Column(name = "nom_agence", nullable = true)
    private String nomAgence;

    @Pattern(regexp = "^[0-9]{8}$", message = "Le numéro de licence doit contenir 8 chiffres")
    @Column(name = "numero_licence", unique = true)
    private String numeroLicence;

    @Column(name = "site_web")
    private String siteWeb;

    @Column(name = "nombre_employes")
    private Integer nombreEmployes;

    @Column(name = "zones_couverture")
    private String zonesCouverture;

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(name = "max_annonces")
    private Integer maxAnnonces = 100;

    @Column(name = "current_annonces")
    private Integer currentAnnonces = 0;

    public boolean canPublishAnnonce() {
        return currentAnnonces < maxAnnonces && isVerified;
    }

    public void incrementAnnonceCount() {
        if (currentAnnonces < maxAnnonces) {
            currentAnnonces++;
        }
    }

    public void decrementAnnonceCount() {
        if (currentAnnonces > 0) {
            currentAnnonces--;
        }
    }
}