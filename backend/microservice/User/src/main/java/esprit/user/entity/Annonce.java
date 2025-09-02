package esprit.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "annonces")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 10, max = 200, message = "Le titre doit contenir entre 10 et 200 caractères")
    @Column(nullable = false, length = 200)
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    @Size(min = 50, max = 2000, message = "La description doit contenir entre 50 et 2000 caractères")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prix;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeBien typeBien;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTransaction typeTransaction;

    @NotBlank(message = "L'adresse est obligatoire")
    @Size(max = 500, message = "L'adresse ne doit pas dépasser 500 caractères")
    @Column(nullable = false, length = 500)
    private String adresse;

    @NotBlank(message = "La ville est obligatoire")
    @Size(max = 100, message = "La ville ne doit pas dépasser 100 caractères")
    @Column(nullable = false, length = 100)
    private String ville;

    @NotBlank(message = "Le code postal est obligatoire")
    @Pattern(regexp = "\\d{4}", message = "Le code postal doit contenir 4 chiffres")
    @Column(nullable = false, length = 4)
    private String codePostal;

    @Min(value = 0, message = "La surface doit être positive")
    @Column(nullable = true)
    private Integer surface;

    @Min(value = 0, message = "Le nombre de chambres doit être positif")
    @Column(nullable = true)
    private Integer nombreChambres;

    @Min(value = 0, message = "Le nombre de salles de bain doit être positif")
    @Column(nullable = true)
    private Integer nombreSallesBain;

    @Column(nullable = true)
    private Boolean garage;

    @Column(nullable = true)
    private Boolean jardin;

    @Column(nullable = true)
    private Boolean piscine;

    @Column(nullable = true)
    private Boolean climatisation;

    @Column(nullable = true)
    private Boolean ascenseur;

    @Column(nullable = true)
    private Integer etage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAnnonce status = StatusAnnonce.ACTIVE;

    // Stockage des URLs des images
    @ElementCollection
    @CollectionTable(name = "annonce_images", joinColumns = @JoinColumn(name = "annonce_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User createur;

    @NotBlank(message = "Le nom du contact est obligatoire")
    @Size(max = 100, message = "Le nom du contact ne doit pas dépasser 100 caractères")
    @Column(nullable = false, length = 100)
    private String nomContact;

    @NotBlank(message = "Le téléphone du contact est obligatoire")
    @Pattern(regexp = "\\d{8}", message = "Le téléphone doit contenir 8 chiffres")
    @Column(nullable = false, length = 8)
    private String telephoneContact;

    @Email(message = "Format d'email invalide")
    @Column(length = 150)
    private String emailContact;

    @Column(nullable = true)
    private Integer vues = 0;

    @Column(nullable = true)
    private Integer favoris = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime dateMiseAJour;

    @Column(nullable = true)
    private LocalDateTime dateExpiration;

    // Méthodes utilitaires
    public void incrementerVues() {
        this.vues = (this.vues == null) ? 1 : this.vues + 1;
    }

    public void incrementerFavoris() {
        this.favoris = (this.favoris == null) ? 1 : this.favoris + 1;
    }

    public void decrementerFavoris() {
        this.favoris = (this.favoris == null || this.favoris == 0) ? 0 : this.favoris - 1;
    }

    public boolean isExpired() {
        return dateExpiration != null && LocalDateTime.now().isAfter(dateExpiration);
    }

    // Enums
    public enum TypeBien {
        APPARTEMENT("Appartement"),
        VILLA("Villa"), 
        STUDIO("Studio"),
        DUPLEX("Duplex"),
        PENTHOUSE("Penthouse"),
        MAISON("Maison"),
        TERRAIN("Terrain"),
        LOCAL_COMMERCIAL("Local Commercial"),
        BUREAU("Bureau"),
        ENTREPOT("Entrepôt");

        private final String displayName;

        TypeBien(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum TypeTransaction {
        VENTE("Vente"),
        LOCATION("Location");

        private final String displayName;

        TypeTransaction(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum StatusAnnonce {
        ACTIVE("Active"),
        INACTIVE("Inactive"),
        VENDU("Vendu"),
        LOUE("Loué"),
        EXPIRE("Expiré"),
        BROUILLON("Brouillon");

        private final String displayName;

        StatusAnnonce(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}