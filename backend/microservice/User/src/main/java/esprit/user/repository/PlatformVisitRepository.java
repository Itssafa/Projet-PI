package esprit.user.repository;

import esprit.user.entity.PlatformVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlatformVisitRepository extends JpaRepository<PlatformVisit, Long> {

    List<PlatformVisit> findByVisitDate(LocalDate visitDate);

    List<PlatformVisit> findByVisitDateBetween(LocalDate startDate, LocalDate endDate);

    List<PlatformVisit> findByUserId(Long userId);

    @Query("SELECT COUNT(pv) FROM PlatformVisit pv WHERE pv.visitDate = :date")
    long countVisitsByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(pv) FROM PlatformVisit pv WHERE pv.visitDate >= :startDate AND pv.visitDate <= :endDate")
    long countVisitsBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT pv.visitDate, COUNT(pv) FROM PlatformVisit pv WHERE pv.visitDate >= :startDate AND pv.visitDate <= :endDate GROUP BY pv.visitDate ORDER BY pv.visitDate")
    List<Object[]> getVisitStatsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT pv.ipAddress) FROM PlatformVisit pv WHERE pv.visitDate = :date")
    long countUniqueVisitorsByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT pv.sessionId) FROM PlatformVisit pv WHERE pv.visitDate = :date")
    long countUniqueSessionsByDate(@Param("date") LocalDate date);

    @Query("SELECT AVG(pv.durationSeconds) FROM PlatformVisit pv WHERE pv.visitDate = :date AND pv.durationSeconds IS NOT NULL")
    Double getAverageVisitDurationByDate(@Param("date") LocalDate date);

    @Query("SELECT pv.pageUrl, COUNT(pv) FROM PlatformVisit pv WHERE pv.visitDate >= :startDate AND pv.visitDate <= :endDate GROUP BY pv.pageUrl ORDER BY COUNT(pv) DESC")
    List<Object[]> getMostVisitedPages(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}