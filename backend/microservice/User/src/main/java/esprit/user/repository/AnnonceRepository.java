package esprit.user.repository;

import esprit.user.entity.Annonce;
import esprit.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long>, JpaSpecificationExecutor<Annonce> {

    // Trouver toutes les annonces d'un utilisateur
    Page<Annonce> findByCreateurOrderByDateCreationDesc(User createur, Pageable pageable);
    
    // Trouver toutes les annonces actives
    Page<Annonce> findByStatusOrderByDateCreationDesc(Annonce.StatusAnnonce status, Pageable pageable);

    // Trouver les annonces par ville
    Page<Annonce> findByVilleContainingIgnoreCaseAndStatusOrderByDateCreationDesc(
        String ville, Annonce.StatusAnnonce status, Pageable pageable);

    // Trouver les annonces par type de bien
    Page<Annonce> findByTypeBienAndStatusOrderByDateCreationDesc(
        Annonce.TypeBien typeBien, Annonce.StatusAnnonce status, Pageable pageable);

    // Trouver les annonces par type de transaction
    Page<Annonce> findByTypeTransactionAndStatusOrderByDateCreationDesc(
        Annonce.TypeTransaction typeTransaction, Annonce.StatusAnnonce status, Pageable pageable);

    // Recherche par fourchette de prix
    Page<Annonce> findByPrixBetweenAndStatusOrderByDateCreationDesc(
        BigDecimal prixMin, BigDecimal prixMax, Annonce.StatusAnnonce status, Pageable pageable);

    // Recherche par surface
    Page<Annonce> findBySurfaceBetweenAndStatusOrderByDateCreationDesc(
        Integer surfaceMin, Integer surfaceMax, Annonce.StatusAnnonce status, Pageable pageable);

    // Recherche par titre
    Page<Annonce> findByTitreContainingIgnoreCaseAndStatusOrderByDateCreationDesc(
        String titre, Annonce.StatusAnnonce status, Pageable pageable);

    // Recherche complexe avec Query personnalisée
    @Query("SELECT a FROM Annonce a WHERE " +
           "(:titre IS NULL OR LOWER(a.titre) LIKE LOWER(CONCAT('%', :titre, '%'))) AND " +
           "(:ville IS NULL OR LOWER(a.ville) LIKE LOWER(CONCAT('%', :ville, '%'))) AND " +
           "(:typeBien IS NULL OR a.typeBien = :typeBien) AND " +
           "(:typeTransaction IS NULL OR a.typeTransaction = :typeTransaction) AND " +
           "(:prixMin IS NULL OR a.prix >= :prixMin) AND " +
           "(:prixMax IS NULL OR a.prix <= :prixMax) AND " +
           "(:surfaceMin IS NULL OR a.surface >= :surfaceMin) AND " +
           "(:surfaceMax IS NULL OR a.surface <= :surfaceMax) AND " +
           "(:nombreChambres IS NULL OR a.nombreChambres >= :nombreChambres) AND " +
           "(:nombreSallesBain IS NULL OR a.nombreSallesBain >= :nombreSallesBain) AND " +
           "(:garage IS NULL OR a.garage = :garage) AND " +
           "(:jardin IS NULL OR a.jardin = :jardin) AND " +
           "(:piscine IS NULL OR a.piscine = :piscine) AND " +
           "(:climatisation IS NULL OR a.climatisation = :climatisation) AND " +
           "(:ascenseur IS NULL OR a.ascenseur = :ascenseur) AND " +
           "a.status = :status")
    Page<Annonce> findWithFilters(
        @Param("titre") String titre,
        @Param("ville") String ville,
        @Param("typeBien") Annonce.TypeBien typeBien,
        @Param("typeTransaction") Annonce.TypeTransaction typeTransaction,
        @Param("prixMin") BigDecimal prixMin,
        @Param("prixMax") BigDecimal prixMax,
        @Param("surfaceMin") Integer surfaceMin,
        @Param("surfaceMax") Integer surfaceMax,
        @Param("nombreChambres") Integer nombreChambres,
        @Param("nombreSallesBain") Integer nombreSallesBain,
        @Param("garage") Boolean garage,
        @Param("jardin") Boolean jardin,
        @Param("piscine") Boolean piscine,
        @Param("climatisation") Boolean climatisation,
        @Param("ascenseur") Boolean ascenseur,
        @Param("status") Annonce.StatusAnnonce status,
        Pageable pageable
    );

    // Statistiques
    @Query("SELECT COUNT(a) FROM Annonce a WHERE a.createur = :createur")
    long countByCreateur(@Param("createur") User createur);

    @Query("SELECT COUNT(a) FROM Annonce a WHERE a.createur = :createur AND a.status = :status")
    long countByCreateurAndStatus(@Param("createur") User createur, @Param("status") Annonce.StatusAnnonce status);

    @Query("SELECT SUM(a.vues) FROM Annonce a WHERE a.createur = :createur")
    Long sumVuesByCreateur(@Param("createur") User createur);

    @Query("SELECT SUM(a.favoris) FROM Annonce a WHERE a.createur = :createur")
    Long sumFavorisByCreateur(@Param("createur") User createur);

    @Query("SELECT AVG(a.prix) FROM Annonce a WHERE a.status = :status")
    Double avgPrixByStatus(@Param("status") Annonce.StatusAnnonce status);

    @Query("SELECT AVG(a.surface) FROM Annonce a WHERE a.status = :status AND a.surface IS NOT NULL")
    Double avgSurfaceByStatus(@Param("status") Annonce.StatusAnnonce status);

    // Trouver les annonces les plus populaires
    Page<Annonce> findByStatusOrderByVuesDescDateCreationDesc(Annonce.StatusAnnonce status, Pageable pageable);

    // Trouver les annonces récentes
    Page<Annonce> findByStatusAndDateCreationAfterOrderByDateCreationDesc(
        Annonce.StatusAnnonce status, LocalDateTime date, Pageable pageable);

    // Trouver les annonces expirées
    List<Annonce> findByDateExpirationBefore(LocalDateTime date);

    // Compter les annonces par ville
    @Query("SELECT a.ville, COUNT(a) FROM Annonce a WHERE a.status = :status GROUP BY a.ville ORDER BY COUNT(a) DESC")
    List<Object[]> countByVilleAndStatus(@Param("status") Annonce.StatusAnnonce status);

    // Compter les annonces par type de bien
    @Query("SELECT a.typeBien, COUNT(a) FROM Annonce a WHERE a.status = :status GROUP BY a.typeBien ORDER BY COUNT(a) DESC")
    List<Object[]> countByTypeBienAndStatus(@Param("status") Annonce.StatusAnnonce status);

    // Compter les annonces par status
    long countByStatus(Annonce.StatusAnnonce status);

    // Annonces similaires basées sur type, prix et ville
    @Query("SELECT a FROM Annonce a WHERE " +
           "a.id != :excludeId AND " +
           "a.status = :status AND " +
           "(a.typeBien = :typeBien OR a.ville = :ville) AND " +
           "a.prix BETWEEN :prixMin AND :prixMax " +
           "ORDER BY " +
           "CASE WHEN a.typeBien = :typeBien THEN 1 ELSE 2 END, " +
           "CASE WHEN a.ville = :ville THEN 1 ELSE 2 END, " +
           "ABS(a.prix - :prixRef)")
    List<Annonce> findSimilarAnnonces(
        @Param("excludeId") Long excludeId,
        @Param("status") Annonce.StatusAnnonce status,
        @Param("typeBien") Annonce.TypeBien typeBien,
        @Param("ville") String ville,
        @Param("prixMin") BigDecimal prixMin,
        @Param("prixMax") BigDecimal prixMax,
        @Param("prixRef") BigDecimal prixRef,
        Pageable pageable
    );
}