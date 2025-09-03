package esprit.user.service;

import esprit.user.dto.AnnonceDto.*;
import esprit.user.entity.Annonce;
import esprit.user.entity.User;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import esprit.user.repository.AnnonceRepository;
import esprit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnnonceService {
    
    private final AnnonceRepository annonceRepository;
    private final UserRepository userRepository;
    
    // Conversion Methods
    public AnnonceResponseDto convertToResponseDto(Annonce annonce) {
        AnnonceResponseDto dto = new AnnonceResponseDto();
        dto.setId(annonce.getId());
        dto.setTitre(annonce.getTitre());
        dto.setDescription(annonce.getDescription());
        dto.setPrix(annonce.getPrix());
        dto.setTypeBien(annonce.getTypeBien());
        dto.setTypeTransaction(annonce.getTypeTransaction());
        dto.setAdresse(annonce.getAdresse());
        dto.setVille(annonce.getVille());
        dto.setCodePostal(annonce.getCodePostal());
        dto.setSurface(annonce.getSurface());
        dto.setNombreChambres(annonce.getNombreChambres());
        dto.setNombreSallesBain(annonce.getNombreSallesBain());
        dto.setGarage(annonce.getGarage());
        dto.setJardin(annonce.getJardin());
        dto.setPiscine(annonce.getPiscine());
        dto.setClimatisation(annonce.getClimatisation());
        dto.setAscenseur(annonce.getAscenseur());
        dto.setEtage(annonce.getEtage());
        dto.setStatus(annonce.getStatus());
        dto.setImages(annonce.getImages());
        dto.setNomContact(annonce.getNomContact());
        dto.setTelephoneContact(annonce.getTelephoneContact());
        dto.setEmailContact(annonce.getEmailContact());
        dto.setVues(annonce.getVues());
        dto.setFavoris(annonce.getFavoris());
        dto.setDateCreation(annonce.getDateCreation());
        dto.setDateMiseAJour(annonce.getDateMiseAJour());
        dto.setDateExpiration(annonce.getDateExpiration());
        
        // Info du créateur
        User createur = annonce.getCreateur();
        if (createur != null) {
            dto.setCreateurId(createur.getId());
            dto.setCreateurNom(createur.getNom());
            dto.setCreateurPrenom(createur.getPrenom());
            dto.setCreateurType(createur.getUserType().name());
        }
        
        return dto;
    }
    
    public AnnonceSummaryDto convertToSummaryDto(Annonce annonce) {
        AnnonceSummaryDto dto = new AnnonceSummaryDto();
        dto.setId(annonce.getId());
        dto.setTitre(annonce.getTitre());
        dto.setPrix(annonce.getPrix());
        dto.setTypeBien(annonce.getTypeBien());
        dto.setTypeTransaction(annonce.getTypeTransaction());
        dto.setVille(annonce.getVille());
        dto.setSurface(annonce.getSurface());
        dto.setNombreChambres(annonce.getNombreChambres());
        dto.setPremierImage(annonce.getImages() != null && !annonce.getImages().isEmpty() ? 
                          annonce.getImages().get(0) : null);
        dto.setVues(annonce.getVues());
        dto.setFavoris(annonce.getFavoris());
        dto.setDateCreation(annonce.getDateCreation());
        dto.setStatus(annonce.getStatus());
        
        // Info du créateur
        User createur = annonce.getCreateur();
        if (createur != null) {
            dto.setCreateurNom(createur.getNom() + " " + createur.getPrenom());
            dto.setCreateurType(createur.getUserType().name());
        }
        
        return dto;
    }
    
    private Annonce convertFromCreateDto(AnnonceCreateDto createDto, User createur) {
        Annonce annonce = new Annonce();
        annonce.setTitre(createDto.getTitre());
        annonce.setDescription(createDto.getDescription());
        annonce.setPrix(createDto.getPrix());
        annonce.setTypeBien(createDto.getTypeBien());
        annonce.setTypeTransaction(createDto.getTypeTransaction());
        annonce.setAdresse(createDto.getAdresse());
        annonce.setVille(createDto.getVille());
        annonce.setCodePostal(createDto.getCodePostal());
        annonce.setSurface(createDto.getSurface());
        annonce.setNombreChambres(createDto.getNombreChambres());
        annonce.setNombreSallesBain(createDto.getNombreSallesBain());
        annonce.setGarage(createDto.getGarage());
        annonce.setJardin(createDto.getJardin());
        annonce.setPiscine(createDto.getPiscine());
        annonce.setClimatisation(createDto.getClimatisation());
        annonce.setAscenseur(createDto.getAscenseur());
        annonce.setEtage(createDto.getEtage());
        annonce.setImages(createDto.getImages());
        annonce.setNomContact(createDto.getNomContact());
        annonce.setTelephoneContact(createDto.getTelephoneContact());
        annonce.setEmailContact(createDto.getEmailContact());
        annonce.setDateExpiration(createDto.getDateExpiration());
        annonce.setCreateur(createur);
        annonce.setStatus(Annonce.StatusAnnonce.ACTIVE);
        
        return annonce;
    }
    
    // CRUD Operations
    @Transactional
    public AnnonceResponseDto createAnnonce(AnnonceCreateDto createDto, String userEmail) {
        log.info("Creating annonce for user: {}", userEmail);
        
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        
        Annonce annonce = convertFromCreateDto(createDto, user);
        Annonce savedAnnonce = annonceRepository.save(annonce);
        
        log.info("Created annonce with ID: {}", savedAnnonce.getId());
        return convertToResponseDto(savedAnnonce);
    }
    
    @Transactional(readOnly = true)
    public AnnonceResponseDto getAnnonceById(Long id, String userEmail) {
        Annonce annonce = annonceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce non trouvée"));
        
        // Incrémenter les vues seulement si ce n'est pas le créateur
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null && !annonce.getCreateur().getId().equals(user.getId())) {
            annonce.incrementerVues();
            annonceRepository.save(annonce);
        }
        
        return convertToResponseDto(annonce);
    }
    
    @Transactional
    public AnnonceResponseDto updateAnnonce(Long id, AnnonceUpdateDto updateDto, String userEmail) {
        log.info("Updating annonce {} for user: {}", id, userEmail);
        
        Annonce annonce = annonceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce non trouvée"));
        
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        
        // Vérifier que l'utilisateur est le propriétaire de l'annonce
        if (!annonce.getCreateur().getId().equals(user.getId())) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à modifier cette annonce");
        }
        
        // Mise à jour des champs
        if (updateDto.getTitre() != null) annonce.setTitre(updateDto.getTitre());
        if (updateDto.getDescription() != null) annonce.setDescription(updateDto.getDescription());
        if (updateDto.getPrix() != null) annonce.setPrix(updateDto.getPrix());
        if (updateDto.getTypeBien() != null) annonce.setTypeBien(updateDto.getTypeBien());
        if (updateDto.getTypeTransaction() != null) annonce.setTypeTransaction(updateDto.getTypeTransaction());
        if (updateDto.getAdresse() != null) annonce.setAdresse(updateDto.getAdresse());
        if (updateDto.getVille() != null) annonce.setVille(updateDto.getVille());
        if (updateDto.getCodePostal() != null) annonce.setCodePostal(updateDto.getCodePostal());
        if (updateDto.getSurface() != null) annonce.setSurface(updateDto.getSurface());
        if (updateDto.getNombreChambres() != null) annonce.setNombreChambres(updateDto.getNombreChambres());
        if (updateDto.getNombreSallesBain() != null) annonce.setNombreSallesBain(updateDto.getNombreSallesBain());
        if (updateDto.getGarage() != null) annonce.setGarage(updateDto.getGarage());
        if (updateDto.getJardin() != null) annonce.setJardin(updateDto.getJardin());
        if (updateDto.getPiscine() != null) annonce.setPiscine(updateDto.getPiscine());
        if (updateDto.getClimatisation() != null) annonce.setClimatisation(updateDto.getClimatisation());
        if (updateDto.getAscenseur() != null) annonce.setAscenseur(updateDto.getAscenseur());
        if (updateDto.getEtage() != null) annonce.setEtage(updateDto.getEtage());
        if (updateDto.getStatus() != null) annonce.setStatus(updateDto.getStatus());
        if (updateDto.getImages() != null) annonce.setImages(updateDto.getImages());
        if (updateDto.getNomContact() != null) annonce.setNomContact(updateDto.getNomContact());
        if (updateDto.getTelephoneContact() != null) annonce.setTelephoneContact(updateDto.getTelephoneContact());
        if (updateDto.getEmailContact() != null) annonce.setEmailContact(updateDto.getEmailContact());
        if (updateDto.getDateExpiration() != null) annonce.setDateExpiration(updateDto.getDateExpiration());
        
        Annonce savedAnnonce = annonceRepository.save(annonce);
        log.info("Updated annonce with ID: {}", savedAnnonce.getId());
        
        return convertToResponseDto(savedAnnonce);
    }
    
    @Transactional
    public void deleteAnnonce(Long id, String userEmail) {
        log.info("Deleting annonce {} for user: {}", id, userEmail);
        
        Annonce annonce = annonceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce non trouvée"));
        
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        
        // Vérifier que l'utilisateur est le propriétaire ou admin
        if (!annonce.getCreateur().getId().equals(user.getId()) && 
            !user.getUserType().name().equals("ADMINISTRATEUR")) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à supprimer cette annonce");
        }
        
        annonceRepository.delete(annonce);
        log.info("Deleted annonce with ID: {}", id);
    }
    
    // Search and Filter Operations
    @Transactional(readOnly = true)
    public Page<AnnonceSummaryDto> searchAnnonces(AnnonceSearchDto searchDto) {
        log.info("Searching annonces with filters: {}", searchDto);
        
        Sort sort = createSort(searchDto.getSortBy(), searchDto.getSortDirection());
        Pageable pageable = PageRequest.of(searchDto.getPage(), searchDto.getSize(), sort);
        
        Page<Annonce> annonces = annonceRepository.findWithFilters(
            searchDto.getTitre(),
            searchDto.getVille(),
            searchDto.getTypeBien(),
            searchDto.getTypeTransaction(),
            searchDto.getPrixMin(),
            searchDto.getPrixMax(),
            searchDto.getSurfaceMin(),
            searchDto.getSurfaceMax(),
            searchDto.getNombreChambresMin(),
            searchDto.getNombreSallesBainMin(),
            searchDto.getGarage(),
            searchDto.getJardin(),
            searchDto.getPiscine(),
            searchDto.getClimatisation(),
            searchDto.getAscenseur(),
            searchDto.getStatus() != null ? searchDto.getStatus() : Annonce.StatusAnnonce.ACTIVE,
            pageable
        );
        
        return annonces.map(this::convertToSummaryDto);
    }
    
    @Transactional(readOnly = true)
    public Page<AnnonceSummaryDto> getAllActiveAnnonces(int page, int size, String sortBy, String sortDirection) {
        Sort sort = createSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Annonce> annonces = annonceRepository.findByStatusOrderByDateCreationDesc(
            Annonce.StatusAnnonce.ACTIVE, pageable);
        
        return annonces.map(this::convertToSummaryDto);
    }
    
    @Transactional(readOnly = true)
    public Page<AnnonceSummaryDto> getMyAnnonces(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Annonce> annonces = annonceRepository.findByCreateurOrderByDateCreationDesc(user, pageable);
        
        return annonces.map(this::convertToSummaryDto);
    }
    
    @Transactional(readOnly = true)
    public List<AnnonceSummaryDto> getSimilarAnnonces(Long annonceId, int limit) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce non trouvée"));
        
        // Calculer la fourchette de prix (±30%)
        BigDecimal prixRef = annonce.getPrix();
        BigDecimal prixMin = prixRef.multiply(BigDecimal.valueOf(0.7));
        BigDecimal prixMax = prixRef.multiply(BigDecimal.valueOf(1.3));
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Annonce> similaires = annonceRepository.findSimilarAnnonces(
            annonceId,
            Annonce.StatusAnnonce.ACTIVE,
            annonce.getTypeBien(),
            annonce.getVille(),
            prixMin,
            prixMax,
            prixRef,
            pageable
        );
        
        return similaires.stream()
            .map(this::convertToSummaryDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AnnonceSummaryDto> getPopularAnnonces(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<Annonce> annonces = annonceRepository.findByStatusOrderByVuesDescDateCreationDesc(
            Annonce.StatusAnnonce.ACTIVE, pageable);
        
        return annonces.getContent().stream()
            .map(this::convertToSummaryDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AnnonceSummaryDto> getRecentAnnonces(int days, int limit) {
        LocalDateTime sinceDate = LocalDateTime.now().minusDays(days);
        Pageable pageable = PageRequest.of(0, limit);
        
        Page<Annonce> annonces = annonceRepository.findByStatusAndDateCreationAfterOrderByDateCreationDesc(
            Annonce.StatusAnnonce.ACTIVE, sinceDate, pageable);
        
        return annonces.getContent().stream()
            .map(this::convertToSummaryDto)
            .collect(Collectors.toList());
    }
    
    // Statistics
    @Transactional(readOnly = true)
    public AnnonceStatsDto getMyAnnonceStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        
        AnnonceStatsDto stats = new AnnonceStatsDto();
        stats.setTotalAnnonces(annonceRepository.countByCreateur(user));
        stats.setAnnoncesActives(annonceRepository.countByCreateurAndStatus(user, Annonce.StatusAnnonce.ACTIVE));
        stats.setAnnoncesInactives(annonceRepository.countByCreateurAndStatus(user, Annonce.StatusAnnonce.INACTIVE));
        stats.setAnnoncesVendues(annonceRepository.countByCreateurAndStatus(user, Annonce.StatusAnnonce.VENDU));
        stats.setAnnoncesLouees(annonceRepository.countByCreateurAndStatus(user, Annonce.StatusAnnonce.LOUE));
        
        Long totalVues = annonceRepository.sumVuesByCreateur(user);
        stats.setTotalVues(totalVues != null ? totalVues : 0L);
        
        Long totalFavoris = annonceRepository.sumFavorisByCreateur(user);
        stats.setTotalFavoris(totalFavoris != null ? totalFavoris : 0L);
        
        return stats;
    }
    
    @Transactional(readOnly = true)
    public AnnonceStatsDto getGlobalStats() {
        AnnonceStatsDto stats = new AnnonceStatsDto();
        stats.setTotalAnnonces(annonceRepository.count());
        stats.setAnnoncesActives(annonceRepository.countByStatus(Annonce.StatusAnnonce.ACTIVE));
        stats.setAnnoncesInactives(annonceRepository.countByStatus(Annonce.StatusAnnonce.INACTIVE));
        stats.setAnnoncesVendues(annonceRepository.countByStatus(Annonce.StatusAnnonce.VENDU));
        stats.setAnnoncesLouees(annonceRepository.countByStatus(Annonce.StatusAnnonce.LOUE));
        
        Double prixMoyen = annonceRepository.avgPrixByStatus(Annonce.StatusAnnonce.ACTIVE);
        stats.setPrixMoyen(prixMoyen != null ? BigDecimal.valueOf(prixMoyen) : BigDecimal.ZERO);
        
        Double surfaceMoyenne = annonceRepository.avgSurfaceByStatus(Annonce.StatusAnnonce.ACTIVE);
        stats.setSurfaceMoyenne(surfaceMoyenne != null ? surfaceMoyenne.intValue() : 0);
        
        return stats;
    }
    
    // Helper Methods
    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? 
            Sort.Direction.ASC : Sort.Direction.DESC;
        
        return switch (sortBy.toLowerCase()) {
            case "prix" -> Sort.by(direction, "prix");
            case "surface" -> Sort.by(direction, "surface");
            case "vues" -> Sort.by(direction, "vues");
            case "favoris" -> Sort.by(direction, "favoris");
            case "ville" -> Sort.by(direction, "ville");
            default -> Sort.by(direction, "dateCreation");
        };
    }
    
    // Batch Operations
    @Transactional
    public void markExpiredAnnonces() {
        List<Annonce> expiredAnnonces = annonceRepository.findByDateExpirationBefore(LocalDateTime.now());
        
        for (Annonce annonce : expiredAnnonces) {
            if (annonce.getStatus() == Annonce.StatusAnnonce.ACTIVE) {
                annonce.setStatus(Annonce.StatusAnnonce.EXPIRE);
            }
        }
        
        if (!expiredAnnonces.isEmpty()) {
            annonceRepository.saveAll(expiredAnnonces);
            log.info("Marked {} annonces as expired", expiredAnnonces.size());
        }
    }
}