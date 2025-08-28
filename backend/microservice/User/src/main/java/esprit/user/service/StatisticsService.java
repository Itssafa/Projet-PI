package esprit.user.service;

import esprit.user.dto.StatisticsDto;
import esprit.user.entity.UserStatus;
import esprit.user.entity.UserType;
import esprit.user.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final UserRepository userRepository;
    private final AgenceImmobiliereRepository agenceImmobiliereRepository;
    private final PlatformVisitRepository platformVisitRepository;

    public StatisticsDto getStatistics() {
        StatisticsDto stats = new StatisticsDto();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalClients(userRepository.countByUserType(UserType.CLIENT_ABONNE));
        stats.setTotalAgencies(userRepository.countByUserType(UserType.AGENCE_IMMOBILIERE));
        stats.setTotalAdmins(userRepository.countByUserType(UserType.ADMINISTRATEUR));

        stats.setVerifiedAgencies(agenceImmobiliereRepository.countVerifiedAgencies());
        stats.setUnverifiedAgencies(agenceImmobiliereRepository.countUnverifiedAgencies());

        stats.setActiveUsers(userRepository.countByStatus(UserStatus.ACTIVE));
        stats.setPendingUsers(userRepository.countByStatus(UserStatus.PENDING));

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minus(6, ChronoUnit.DAYS);
        LocalDate monthStart = today.minus(29, ChronoUnit.DAYS);

        stats.setTotalVisitsToday(platformVisitRepository.countVisitsByDate(today));
        stats.setTotalVisitsThisWeek(platformVisitRepository.countVisitsBetween(weekStart, today));
        stats.setTotalVisitsThisMonth(platformVisitRepository.countVisitsBetween(monthStart, today));

        stats.setUniqueVisitorsToday(platformVisitRepository.countUniqueVisitorsByDate(today));
        stats.setAverageVisitDuration(platformVisitRepository.getAverageVisitDurationByDate(today));

        stats.setDailyVisits(getDailyVisitsMap(weekStart, today));
        stats.setUserTypeDistribution(getUserTypeDistribution());
        stats.setMostVisitedPages(getMostVisitedPages(weekStart, today));

        Long totalAnnonces = agenceImmobiliereRepository.getTotalActiveAnnonces();
        stats.setTotalAnnoncesPublished(totalAnnonces != null ? totalAnnonces : 0L);

        return stats;
    }

    private Map<LocalDate, Long> getDailyVisitsMap(LocalDate startDate, LocalDate endDate) {
        List<Object[]> dailyVisits = platformVisitRepository.getVisitStatsByDateRange(startDate, endDate);
        return dailyVisits.stream()
            .collect(Collectors.toMap(
                row -> (LocalDate) row[0],
                row -> (Long) row[1]
            ));
    }

    private Map<String, Long> getUserTypeDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        for (UserType userType : UserType.values()) {
            long count = userRepository.countByUserType(userType);
            distribution.put(userType.name(), count);
        }
        return distribution;
    }

    private Map<String, Long> getMostVisitedPages(LocalDate startDate, LocalDate endDate) {
        List<Object[]> pageVisits = platformVisitRepository.getMostVisitedPages(startDate, endDate);
        return pageVisits.stream()
            .limit(10)
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1],
                (existing, replacement) -> existing,
                HashMap::new
            ));
    }

    public StatisticsDto getWeeklyStatistics() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minus(6, ChronoUnit.DAYS);
        
        StatisticsDto stats = new StatisticsDto();
        stats.setTotalVisitsThisWeek(platformVisitRepository.countVisitsBetween(weekStart, today));
        stats.setDailyVisits(getDailyVisitsMap(weekStart, today));
        
        return stats;
    }

    public Map<String, Long> getAnnonceStatistics() {
        Map<String, Long> stats = new HashMap<>();
        Long totalAnnonces = agenceImmobiliereRepository.getTotalActiveAnnonces();
        stats.put("total_annonces", totalAnnonces != null ? totalAnnonces : 0L);
        stats.put("verified_agencies", agenceImmobiliereRepository.countVerifiedAgencies());
        stats.put("unverified_agencies", agenceImmobiliereRepository.countUnverifiedAgencies());
        
        return stats;
    }
}