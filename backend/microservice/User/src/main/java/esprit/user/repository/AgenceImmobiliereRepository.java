package esprit.user.repository;

import esprit.user.entity.AgenceImmobiliere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgenceImmobiliereRepository extends JpaRepository<AgenceImmobiliere, Long> {

    Optional<AgenceImmobiliere> findByNumeroLicence(String numeroLicence);

    List<AgenceImmobiliere> findByIsVerified(boolean isVerified);

    List<AgenceImmobiliere> findByZonesCouvertureContaining(String zone);

    @Query("SELECT a FROM AgenceImmobiliere a WHERE a.nomAgence LIKE %:keyword% OR a.zonesCouverture LIKE %:keyword%")
    List<AgenceImmobiliere> findByKeyword(@Param("keyword") String keyword);

    @Query("SELECT COUNT(a) FROM AgenceImmobiliere a WHERE a.isVerified = true")
    long countVerifiedAgencies();

    @Query("SELECT COUNT(a) FROM AgenceImmobiliere a WHERE a.isVerified = false")
    long countUnverifiedAgencies();

    @Query("SELECT SUM(a.currentAnnonces) FROM AgenceImmobiliere a WHERE a.isVerified = true")
    Long getTotalActiveAnnonces();

    @Query("SELECT a FROM AgenceImmobiliere a WHERE a.currentAnnonces >= a.maxAnnonces")
    List<AgenceImmobiliere> findAgenciesAtCapacity();

    boolean existsByNumeroLicence(String numeroLicence);
}