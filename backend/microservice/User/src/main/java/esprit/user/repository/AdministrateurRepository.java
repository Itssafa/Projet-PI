package esprit.user.repository;

import esprit.user.entity.AdminLevel;
import esprit.user.entity.Administrateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdministrateurRepository extends JpaRepository<Administrateur, Long> {

    List<Administrateur> findByAdminLevel(AdminLevel adminLevel);

    List<Administrateur> findByDepartment(String department);

    List<Administrateur> findByCanManageUsers(boolean canManageUsers);

    List<Administrateur> findByCanManageAgencies(boolean canManageAgencies);

    @Query("SELECT a FROM Administrateur a WHERE a.lastAdminAction >= :startDate AND a.lastAdminAction <= :endDate")
    List<Administrateur> findActiveAdminsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(a) FROM Administrateur a WHERE a.adminLevel = :adminLevel")
    long countByAdminLevel(@Param("adminLevel") AdminLevel adminLevel);

    @Query("SELECT a FROM Administrateur a WHERE a.canManageSystem = true")
    List<Administrateur> findSystemAdmins();
}