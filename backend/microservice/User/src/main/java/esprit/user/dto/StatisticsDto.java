package esprit.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDto {

    private long totalUsers;
    private long totalClients;
    private long totalAgencies;
    private long totalAdmins;
    private long verifiedAgencies;
    private long unverifiedAgencies;
    private long activeUsers;
    private long pendingUsers;
    private long totalVisitsToday;
    private long totalVisitsThisWeek;
    private long totalVisitsThisMonth;
    private long uniqueVisitorsToday;
    private Double averageVisitDuration;
    private Map<LocalDate, Long> dailyVisits;
    private Map<String, Long> userTypeDistribution;
    private Map<String, Long> mostVisitedPages;
    private long totalAnnoncesPublished;
}