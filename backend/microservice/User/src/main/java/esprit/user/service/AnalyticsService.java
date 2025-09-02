package esprit.user.service;

import esprit.user.dto.AnalyticsDto.*;
import esprit.user.entity.User;
import esprit.user.entity.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    
    private final Random random = new Random();
    
    public ClientAnalytics getClientAnalytics(User user) {
        log.info("Generating client analytics for user: {}", user.getEmail());
        
        List<MetricData> keyMetrics = Arrays.asList(
            new MetricData("Recherches ce mois", 47 + random.nextInt(20), "positive", 23.5 + random.nextDouble() * 10, "search", "#4CAF50"),
            new MetricData("Biens consultés", 156 + random.nextInt(50), "positive", 15.2 + random.nextDouble() * 10, "visibility", "#2196F3"),
            new MetricData("Favoris ajoutés", 12 + random.nextInt(10), "neutral", -2.1 + random.nextDouble() * 5, "favorite", "#FF9800"),
            new MetricData("Alertes actives", 5 + random.nextInt(5), "positive", 8.7 + random.nextDouble() * 5, "notifications", "#9C27B0")
        );
        
        List<ChartData> charts = Arrays.asList(
            createSearchActivityChart(),
            createViewsByPropertyTypeChart(),
            createMonthlyEngagementChart()
        );
        
        SearchAnalytics searchAnalytics = new SearchAnalytics(
            320 + random.nextInt(100),
            47 + random.nextInt(20),
            53 + random.nextInt(50), // remaining searches
            1.56 + random.nextDouble() * 2,
            Arrays.asList("Appartement", "Villa", "Studio", "Duplex"),
            Arrays.asList("Tunis", "Sousse", "Sfax", "Monastir")
        );
        
        List<ActivityData> recentActivity = Arrays.asList(
            new ActivityData(LocalDate.now().minusDays(1), "Recherche", "Appartement 3 pièces à Tunis", "search", "#4CAF50"),
            new ActivityData(LocalDate.now().minusDays(2), "Favori", "Villa ajoutée aux favoris", "favorite", "#FF9800"),
            new ActivityData(LocalDate.now().minusDays(3), "Alerte", "Nouvelle alerte créée pour Sousse", "notifications", "#9C27B0"),
            new ActivityData(LocalDate.now().minusDays(5), "Visite", "Consultation détaillée d'un bien", "visibility", "#2196F3")
        );
        
        SubscriptionInsights subscriptionInsights = new SubscriptionInsights(
            "PREMIUM",
            25 + random.nextInt(10),
            67.5 + random.nextDouble() * 30,
            Arrays.asList("Recherches illimitées", "Alertes avancées", "Support prioritaire"),
            Arrays.asList("Passer à VIP pour encore plus de fonctionnalités", "Profitez des rapports détaillés")
        );
        
        return new ClientAnalytics(keyMetrics, charts, searchAnalytics, recentActivity, subscriptionInsights);
    }
    
    public AgencyAnalytics getAgencyAnalytics(User user) {
        log.info("Generating agency analytics for user: {}", user.getEmail());
        
        List<MetricData> kpis = Arrays.asList(
            new MetricData("Chiffre d'affaires", 127500 + random.nextInt(50000), "positive", 18.3 + random.nextDouble() * 10, "euro", "#4CAF50"),
            new MetricData("Transactions", 23 + random.nextInt(10), "positive", 12.5 + random.nextDouble() * 10, "handshake", "#2196F3"),
            new MetricData("Clients actifs", 89 + random.nextInt(20), "positive", 7.8 + random.nextDouble() * 5, "people", "#FF9800"),
            new MetricData("Taux conversion", 15 + random.nextInt(10), "neutral", -1.2 + random.nextDouble() * 3, "trending_up", "#9C27B0")
        );
        
        List<ChartData> performanceCharts = Arrays.asList(
            createRevenueChart(),
            createSalesPerformanceChart(),
            createClientAcquisitionChart()
        );
        
        PropertyAnalytics propertyAnalytics = new PropertyAnalytics(
            145 + random.nextInt(50),
            23 + random.nextInt(10),
            67 + random.nextInt(20),
            55 + random.nextInt(15),
            45.5 + random.nextDouble() * 20,
            12.3 + random.nextDouble() * 10,
            Arrays.asList(
                new PropertyTypeData("Appartement", 65 + random.nextInt(20), 250000.0 + random.nextDouble() * 100000, "#4CAF50"),
                new PropertyTypeData("Villa", 35 + random.nextInt(15), 450000.0 + random.nextDouble() * 200000, "#2196F3"),
                new PropertyTypeData("Studio", 25 + random.nextInt(10), 150000.0 + random.nextDouble() * 50000, "#FF9800"),
                new PropertyTypeData("Commercial", 20 + random.nextInt(10), 350000.0 + random.nextDouble() * 150000, "#9C27B0")
            )
        );
        
        ClientAnalyticsData clientAnalytics = new ClientAnalyticsData(
            156 + random.nextInt(50),
            89 + random.nextInt(20),
            12 + random.nextInt(8),
            4.7 + random.nextDouble() * 0.3,
            Arrays.asList(
                new ClientSegment("Acheteurs", 45, 45.0, "#4CAF50"),
                new ClientSegment("Locataires", 35, 35.0, "#2196F3"),
                new ClientSegment("Investisseurs", 20, 20.0, "#FF9800")
            )
        );
        
        TeamPerformance teamPerformance = new TeamPerformance(
            8 + random.nextInt(5),
            4.3 + random.nextDouble() * 0.5,
            Arrays.asList(
                new MemberPerformance("Sarah Ahmed", "Agent Senior", 4.8, 15 + random.nextInt(5), 45000.0 + random.nextDouble() * 20000, "SA"),
                new MemberPerformance("Mohamed Ben Ali", "Agent Commercial", 4.6, 12 + random.nextInt(5), 38000.0 + random.nextDouble() * 15000, "MB"),
                new MemberPerformance("Fatima Trabelsi", "Négociatrice", 4.5, 10 + random.nextInt(5), 32000.0 + random.nextDouble() * 12000, "FT")
            ),
            Arrays.asList(
                new MetricData("Performance moyenne", 85 + random.nextInt(10), "positive", 5.2, "trending_up", "#4CAF50"),
                new MetricData("Objectifs atteints", 92, "positive", 8.5, "flag", "#2196F3")
            )
        );
        
        MarketInsights marketInsights = new MarketInsights(
            "growing",
            5.7 + random.nextDouble() * 3,
            Arrays.asList(
                new MarketData("Concurrent A", 25 + random.nextInt(10), "#4CAF50"),
                new MarketData("Concurrent B", 20 + random.nextInt(8), "#2196F3"),
                new MarketData("Concurrent C", 15 + random.nextInt(5), "#FF9800"),
                new MarketData("Autres", 40, "#E0E0E0")
            ),
            Arrays.asList(
                new PriceInsight("Centre-ville Tunis", 280000.0 + random.nextDouble() * 50000, 5.2 + random.nextDouble() * 3, "positive"),
                new PriceInsight("Banlieue Tunis", 180000.0 + random.nextDouble() * 40000, 3.8 + random.nextDouble() * 2, "positive"),
                new PriceInsight("Sousse", 220000.0 + random.nextDouble() * 45000, -1.2 + random.nextDouble() * 3, "negative")
            ),
            Arrays.asList(
                "Concentrez-vous sur les appartements familiaux",
                "Le marché des villas est en croissance",
                "Considérez l'expansion vers Monastir"
            )
        );
        
        return new AgencyAnalytics(kpis, performanceCharts, propertyAnalytics, clientAnalytics, teamPerformance, marketInsights);
    }
    
    private ChartData createSearchActivityChart() {
        List<String> labels = Arrays.asList("Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc");
        List<Integer> data = Arrays.asList(12, 19, 23, 35, 42, 38, 45, 41, 47, 52, 48, 55);
        
        return new ChartData(
            "line",
            "Activité de recherche mensuelle",
            labels,
            Arrays.asList(new ChartDataset("Recherches", data, "rgba(76, 175, 80, 0.2)", "#4CAF50", 2, true))
        );
    }
    
    private ChartData createViewsByPropertyTypeChart() {
        List<String> labels = Arrays.asList("Appartement", "Villa", "Studio", "Duplex", "Commercial");
        List<Integer> data = Arrays.asList(65, 35, 25, 15, 10);
        List<String> colors = Arrays.asList("#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336");
        
        return new ChartData(
            "doughnut",
            "Consultations par type de bien",
            labels,
            Arrays.asList(new ChartDataset("Consultations", data, String.join(",", colors), "", 0, false))
        );
    }
    
    private ChartData createMonthlyEngagementChart() {
        List<String> labels = Arrays.asList("Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4");
        List<Integer> searches = Arrays.asList(12, 15, 8, 12);
        List<Integer> favorites = Arrays.asList(3, 5, 2, 2);
        List<Integer> contacts = Arrays.asList(1, 2, 1, 3);
        
        return new ChartData(
            "bar",
            "Engagement mensuel",
            labels,
            Arrays.asList(
                new ChartDataset("Recherches", searches, "rgba(76, 175, 80, 0.8)", "#4CAF50", 1, false),
                new ChartDataset("Favoris", favorites, "rgba(255, 152, 0, 0.8)", "#FF9800", 1, false),
                new ChartDataset("Contacts", contacts, "rgba(33, 150, 243, 0.8)", "#2196F3", 1, false)
            )
        );
    }
    
    private ChartData createRevenueChart() {
        List<String> labels = Arrays.asList("Jan", "Fév", "Mar", "Avr", "Mai", "Jun");
        List<Integer> revenue = Arrays.asList(85000, 92000, 78000, 105000, 127500, 134000);
        
        return new ChartData(
            "line",
            "Évolution du chiffre d'affaires",
            labels,
            Arrays.asList(new ChartDataset("Revenue", revenue, "rgba(76, 175, 80, 0.2)", "#4CAF50", 3, true))
        );
    }
    
    private ChartData createSalesPerformanceChart() {
        List<String> labels = Arrays.asList("Ventes", "Locations", "Évaluations", "Prospection");
        List<Integer> data = Arrays.asList(23, 45, 12, 67);
        List<String> colors = Arrays.asList("#4CAF50", "#2196F3", "#FF9800", "#9C27B0");
        
        return new ChartData(
            "bar",
            "Performance par activité",
            labels,
            Arrays.asList(new ChartDataset("Activités", data, String.join(",", colors), "", 1, false))
        );
    }
    
    private ChartData createClientAcquisitionChart() {
        List<String> labels = Arrays.asList("Jan", "Fév", "Mar", "Avr", "Mai", "Jun");
        List<Integer> newClients = Arrays.asList(8, 12, 6, 15, 18, 12);
        List<Integer> retainedClients = Arrays.asList(45, 47, 44, 52, 58, 62);
        
        return new ChartData(
            "line",
            "Acquisition et fidélisation clients",
            labels,
            Arrays.asList(
                new ChartDataset("Nouveaux clients", newClients, "rgba(33, 150, 243, 0.3)", "#2196F3", 2, true),
                new ChartDataset("Clients fidélisés", retainedClients, "rgba(76, 175, 80, 0.3)", "#4CAF50", 2, true)
            )
        );
    }
}