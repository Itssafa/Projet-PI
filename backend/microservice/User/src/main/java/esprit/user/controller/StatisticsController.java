package esprit.user.controller;

import esprit.user.dto.StatisticsDto;
import esprit.user.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Slf4j
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> getStatistics() {
        try {
            StatisticsDto statistics = statisticsService.getStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des statistiques: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/weekly")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> getWeeklyStatistics() {
        try {
            StatisticsDto weeklyStats = statisticsService.getWeeklyStatistics();
            return ResponseEntity.ok(weeklyStats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des statistiques hebdomadaires: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/annonces")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> getAnnonceStatistics() {
        try {
            Map<String, Long> annonceStats = statisticsService.getAnnonceStatistics();
            return ResponseEntity.ok(annonceStats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des statistiques d'annonces: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENCE_IMMOBILIERE')")
    public ResponseEntity<?> getDashboardData() {
        try {
            StatisticsDto dashboardData = statisticsService.getStatistics();
            
            return ResponseEntity.ok(Map.of(
                "totalUsers", dashboardData.getTotalUsers(),
                "totalClients", dashboardData.getTotalClients(),
                "totalAgencies", dashboardData.getTotalAgencies(),
                "verifiedAgencies", dashboardData.getVerifiedAgencies(),
                "totalVisitsToday", dashboardData.getTotalVisitsToday(),
                "totalVisitsThisWeek", dashboardData.getTotalVisitsThisWeek(),
                "uniqueVisitorsToday", dashboardData.getUniqueVisitorsToday(),
                "totalAnnoncesPublished", dashboardData.getTotalAnnoncesPublished(),
                "dailyVisits", dashboardData.getDailyVisits(),
                "userTypeDistribution", dashboardData.getUserTypeDistribution()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des données du dashboard: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }
}