package esprit.user.dto;

import esprit.user.entity.Annonce;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AnnonceDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnonceCreateDto {
        @NotBlank(message = "Le titre est obligatoire")
        @Size(min = 10, max = 200, message = "Le titre doit contenir entre 10 et 200 caractères")
        private String titre;

        @NotBlank(message = "La description est obligatoire")
        @Size(min = 20, max = 2000, message = "La description doit contenir entre 20 et 2000 caractères")
        private String description;

        @NotNull(message = "Le prix est obligatoire")
        @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
        private BigDecimal prix;

        @NotNull(message = "Le type de bien est obligatoire")
        private Annonce.TypeBien typeBien;

        @NotNull(message = "Le type de transaction est obligatoire")
        private Annonce.TypeTransaction typeTransaction;

        @NotBlank(message = "L'adresse est obligatoire")
        @Size(max = 500, message = "L'adresse ne doit pas dépasser 500 caractères")
        private String adresse;

        @NotBlank(message = "La ville est obligatoire")
        @Size(max = 100, message = "La ville ne doit pas dépasser 100 caractères")
        private String ville;

        @NotBlank(message = "Le code postal est obligatoire")
        @Pattern(regexp = "\\d{4}", message = "Le code postal doit contenir 4 chiffres")
        private String codePostal;

        @Min(value = 0, message = "La surface doit être positive")
        private Integer surface;

        @Min(value = 0, message = "Le nombre de chambres doit être positif")
        private Integer nombreChambres;

        @Min(value = 0, message = "Le nombre de salles de bain doit être positif")
        private Integer nombreSallesBain;

        private Boolean garage;
        private Boolean jardin;
        private Boolean piscine;
        private Boolean climatisation;
        private Boolean ascenseur;
        private Integer etage;

        private List<String> images;

        @NotBlank(message = "Le nom du contact est obligatoire")
        @Size(max = 100, message = "Le nom du contact ne doit pas dépasser 100 caractères")
        private String nomContact;

        @NotBlank(message = "Le téléphone du contact est obligatoire")
        @Pattern(regexp = "\\d{8}", message = "Le téléphone doit contenir 8 chiffres")
        private String telephoneContact;

        @Email(message = "Format d'email invalide")
        private String emailContact;

        private LocalDateTime dateExpiration;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnonceUpdateDto {
        private String titre;
        private String description;
        private BigDecimal prix;
        private Annonce.TypeBien typeBien;
        private Annonce.TypeTransaction typeTransaction;
        private String adresse;
        private String ville;
        private String codePostal;
        private Integer surface;
        private Integer nombreChambres;
        private Integer nombreSallesBain;
        private Boolean garage;
        private Boolean jardin;
        private Boolean piscine;
        private Boolean climatisation;
        private Boolean ascenseur;
        private Integer etage;
        private Annonce.StatusAnnonce status;
        private List<String> images;
        private String nomContact;
        private String telephoneContact;
        private String emailContact;
        private LocalDateTime dateExpiration;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnonceResponseDto {
        private Long id;
        private String titre;
        private String description;
        private BigDecimal prix;
        private Annonce.TypeBien typeBien;
        private Annonce.TypeTransaction typeTransaction;
        private String adresse;
        private String ville;
        private String codePostal;
        private Integer surface;
        private Integer nombreChambres;
        private Integer nombreSallesBain;
        private Boolean garage;
        private Boolean jardin;
        private Boolean piscine;
        private Boolean climatisation;
        private Boolean ascenseur;
        private Integer etage;
        private Annonce.StatusAnnonce status;
        private List<String> images;
        private String nomContact;
        private String telephoneContact;
        private String emailContact;
        private Integer vues;
        private Integer favoris;
        private LocalDateTime dateCreation;
        private LocalDateTime dateMiseAJour;
        private LocalDateTime dateExpiration;
        
        // Info du créateur (sans données sensibles)
        private Long createurId;
        private String createurNom;
        private String createurPrenom;
        private String createurType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnonceSummaryDto {
        private Long id;
        private String titre;
        private BigDecimal prix;
        private Annonce.TypeBien typeBien;
        private Annonce.TypeTransaction typeTransaction;
        private String ville;
        private Integer surface;
        private Integer nombreChambres;
        private String premierImage;
        private Integer vues;
        private Integer favoris;
        private LocalDateTime dateCreation;
        private Annonce.StatusAnnonce status;
        private String createurNom;
        private String createurType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnonceSearchDto {
        private String titre;
        private Annonce.TypeBien typeBien;
        private Annonce.TypeTransaction typeTransaction;
        private String ville;
        private BigDecimal prixMin;
        private BigDecimal prixMax;
        private Integer surfaceMin;
        private Integer surfaceMax;
        private Integer nombreChambresMin;
        private Integer nombreSallesBainMin;
        private Boolean garage;
        private Boolean jardin;
        private Boolean piscine;
        private Boolean climatisation;
        private Boolean ascenseur;
        private Annonce.StatusAnnonce status;
        private String sortBy = "dateCreation"; // dateCreation, prix, surface, vues
        private String sortDirection = "desc"; // asc, desc
        private int page = 0;
        private int size = 20;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnonceStatsDto {
        private long totalAnnonces;
        private long annoncesActives;
        private long annoncesInactives;
        private long annoncesVendues;
        private long annoncesLouees;
        private long totalVues;
        private long totalFavoris;
        private BigDecimal prixMoyen;
        private int surfaceMoyenne;
    }
}