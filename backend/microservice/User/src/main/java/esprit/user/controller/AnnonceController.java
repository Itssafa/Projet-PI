package esprit.user.controller;

import esprit.user.dto.AnnonceDto.*;
import esprit.user.entity.Annonce;
import esprit.user.service.AnnonceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"}, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class AnnonceController {

    private final AnnonceService annonceService;

    // GET /api/annonces - Recherche d'annonces avec filtres
    @GetMapping
    public ResponseEntity<?> searchAnnonces(
            @RequestParam(required = false) String titre,
            @RequestParam(required = false) Annonce.TypeBien typeBien,
            @RequestParam(required = false) Annonce.TypeTransaction typeTransaction,
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) String prixMin,
            @RequestParam(required = false) String prixMax,
            @RequestParam(required = false) Integer surfaceMin,
            @RequestParam(required = false) Integer surfaceMax,
            @RequestParam(required = false) Integer nombreChambresMin,
            @RequestParam(required = false) Integer nombreSallesBainMin,
            @RequestParam(required = false) Boolean garage,
            @RequestParam(required = false) Boolean jardin,
            @RequestParam(required = false) Boolean piscine,
            @RequestParam(required = false) Boolean climatisation,
            @RequestParam(required = false) Boolean ascenseur,
            @RequestParam(defaultValue = "dateCreation") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            AnnonceSearchDto searchDto = new AnnonceSearchDto();
            searchDto.setTitre(titre);
            searchDto.setTypeBien(typeBien);
            searchDto.setTypeTransaction(typeTransaction);
            searchDto.setVille(ville);
            
            // Conversion des prix
            if (prixMin != null && !prixMin.isEmpty()) {
                searchDto.setPrixMin(new java.math.BigDecimal(prixMin));
            }
            if (prixMax != null && !prixMax.isEmpty()) {
                searchDto.setPrixMax(new java.math.BigDecimal(prixMax));
            }
            
            searchDto.setSurfaceMin(surfaceMin);
            searchDto.setSurfaceMax(surfaceMax);
            searchDto.setNombreChambresMin(nombreChambresMin);
            searchDto.setNombreSallesBainMin(nombreSallesBainMin);
            searchDto.setGarage(garage);
            searchDto.setJardin(jardin);
            searchDto.setPiscine(piscine);
            searchDto.setClimatisation(climatisation);
            searchDto.setAscenseur(ascenseur);
            searchDto.setSortBy(sortBy);
            searchDto.setSortDirection(sortDirection);
            searchDto.setPage(page);
            searchDto.setSize(size);
            
            Page<AnnonceSummaryDto> result = annonceService.searchAnnonces(searchDto);
            
            return ResponseEntity.ok(Map.of(
                "annonces", result.getContent(),
                "currentPage", result.getNumber(),
                "totalPages", result.getTotalPages(),
                "totalElements", result.getTotalElements(),
                "size", result.getSize(),
                "hasNext", result.hasNext(),
                "hasPrevious", result.hasPrevious()
            ));
            
        } catch (Exception e) {
            log.error("Erreur lors de la recherche d'annonces: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/{id} - Obtenir une annonce par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAnnonceById(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            AnnonceResponseDto annonce = annonceService.getAnnonceById(id, userEmail);
            return ResponseEntity.ok(annonce);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la récupération de l'annonce {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la récupération de l'annonce {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // POST /api/annonces - Créer une nouvelle annonce
    @PostMapping
    @PreAuthorize("hasRole('CLIENT_ABONNE') or hasRole('AGENCE_IMMOBILIERE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> createAnnonce(@Valid @RequestBody AnnonceCreateDto createDto, 
                                          Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            AnnonceResponseDto annonce = annonceService.createAnnonce(createDto, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(annonce);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la création de l'annonce: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la création de l'annonce: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // PUT /api/annonces/{id} - Mettre à jour une annonce
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT_ABONNE') or hasRole('AGENCE_IMMOBILIERE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> updateAnnonce(@PathVariable Long id, 
                                          @Valid @RequestBody AnnonceUpdateDto updateDto,
                                          Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            AnnonceResponseDto annonce = annonceService.updateAnnonce(id, updateDto, userEmail);
            return ResponseEntity.ok(annonce);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de l'annonce {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la mise à jour de l'annonce {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // DELETE /api/annonces/{id} - Supprimer une annonce
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT_ABONNE') or hasRole('AGENCE_IMMOBILIERE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteAnnonce(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            annonceService.deleteAnnonce(id, userEmail);
            return ResponseEntity.ok(Map.of("message", "Annonce supprimée avec succès"));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la suppression de l'annonce {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la suppression de l'annonce {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/me - Obtenir mes annonces
    @GetMapping("/me")
    @PreAuthorize("hasRole('CLIENT_ABONNE') or hasRole('AGENCE_IMMOBILIERE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> getMyAnnonces(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Page<AnnonceResponseDto> result = annonceService.getMyAnnonces(userEmail, page, size);
            
            return ResponseEntity.ok(Map.of(
                "annonces", result.getContent(),
                "currentPage", result.getNumber(),
                "totalPages", result.getTotalPages(),
                "totalElements", result.getTotalElements(),
                "size", result.getSize()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des annonces utilisateur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/popular - Obtenir les annonces populaires
    @GetMapping("/popular")
    public ResponseEntity<?> getPopularAnnonces(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<AnnonceSummaryDto> annonces = annonceService.getPopularAnnonces(limit);
            return ResponseEntity.ok(annonces);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des annonces populaires: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/recent - Obtenir les annonces récentes
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentAnnonces(@RequestParam(defaultValue = "7") int days,
                                              @RequestParam(defaultValue = "10") int limit) {
        try {
            List<AnnonceSummaryDto> annonces = annonceService.getRecentAnnonces(days, limit);
            return ResponseEntity.ok(annonces);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des annonces récentes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/{id}/similar - Obtenir les annonces similaires
    @GetMapping("/{id}/similar")
    public ResponseEntity<?> getSimilarAnnonces(@PathVariable Long id,
                                               @RequestParam(defaultValue = "5") int limit) {
        try {
            List<AnnonceSummaryDto> annonces = annonceService.getSimilarAnnonces(id, limit);
            return ResponseEntity.ok(annonces);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la récupération des annonces similaires: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la récupération des annonces similaires: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/stats/me - Obtenir mes statistiques d'annonces
    @GetMapping("/stats/me")
    @PreAuthorize("hasRole('CLIENT_ABONNE') or hasRole('AGENCE_IMMOBILIERE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> getMyAnnonceStats(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            AnnonceStatsDto stats = annonceService.getMyAnnonceStats(userEmail);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des statistiques utilisateur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/stats/global - Obtenir les statistiques globales (admin only)
    @GetMapping("/stats/global")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> getGlobalStats() {
        try {
            AnnonceStatsDto stats = annonceService.getGlobalStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des statistiques globales: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // GET /api/annonces/types - Obtenir tous les types de bien
    @GetMapping("/types")
    public ResponseEntity<?> getTypeBiens() {
        try {
            return ResponseEntity.ok(Map.of(
                "typesBien", Annonce.TypeBien.values(),
                "typesTransaction", Annonce.TypeTransaction.values(),
                "statusAnnonce", Annonce.StatusAnnonce.values()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des types: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }
}