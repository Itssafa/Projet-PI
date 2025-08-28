package esprit.user.repository;

import esprit.user.entity.ClientAbonne;
import esprit.user.entity.SubscriptionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClientAbonneRepository extends JpaRepository<ClientAbonne, Long> {

    List<ClientAbonne> findBySubscriptionType(SubscriptionType subscriptionType);

    List<ClientAbonne> findBySubscriptionEndDateBefore(LocalDate date);

    List<ClientAbonne> findBySubscriptionEndDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(c) FROM ClientAbonne c WHERE c.subscriptionType = :subscriptionType")
    long countBySubscriptionType(@Param("subscriptionType") SubscriptionType subscriptionType);

    @Query("SELECT c FROM ClientAbonne c WHERE c.subscriptionEndDate <= :date AND c.status = 'ACTIVE'")
    List<ClientAbonne> findExpiredActiveSubscriptions(@Param("date") LocalDate date);

    @Query("SELECT SUM(c.currentSearchesToday) FROM ClientAbonne c WHERE c.lastSearchReset = :date")
    Long getTotalSearchesToday(@Param("date") LocalDate date);
}