package esprit.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

public class AnalyticsDto {
    
    // Common analytics data
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricData {
        private String label;
        private Integer value;
        private String trend; // "positive", "negative", "neutral"
        private Double percentage;
        private String icon;
        private String color;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartData {
        private String type; // "line", "bar", "pie", "doughnut"
        private String title;
        private List<String> labels;
        private List<ChartDataset> datasets;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataset {
        private String label;
        private List<Integer> data;
        private String backgroundColor;
        private String borderColor;
        private Integer borderWidth;
        private Boolean fill;
    }
    
    // Client-specific analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientAnalytics {
        private List<MetricData> keyMetrics;
        private List<ChartData> charts;
        private SearchAnalytics searchAnalytics;
        private List<ActivityData> recentActivity;
        private SubscriptionInsights subscriptionInsights;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchAnalytics {
        private Integer totalSearches;
        private Integer searchesThisMonth;
        private Integer searchesRemaining;
        private Double averageSearchesPerDay;
        private List<String> topSearchTypes;
        private List<String> topLocations;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityData {
        private LocalDate date;
        private String activity;
        private String description;
        private String icon;
        private String color;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionInsights {
        private String currentPlan;
        private Integer daysRemaining;
        private Double usagePercentage;
        private List<String> availableFeatures;
        private List<String> upgradeRecommendations;
    }
    
    // Agency-specific analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgencyAnalytics {
        private List<MetricData> kpis;
        private List<ChartData> performanceCharts;
        private PropertyAnalytics propertyAnalytics;
        private ClientAnalyticsData clientAnalytics;
        private TeamPerformance teamPerformance;
        private MarketInsights marketInsights;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyAnalytics {
        private Integer totalProperties;
        private Integer propertiesSold;
        private Integer propertiesRented;
        private Integer activeListings;
        private Double averageSaleTime;
        private Double averageRentTime;
        private List<PropertyTypeData> propertyByType;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyTypeData {
        private String type;
        private Integer count;
        private Double averagePrice;
        private String color;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientAnalyticsData {
        private Integer totalClients;
        private Integer activeClients;
        private Integer newClientsThisMonth;
        private Double clientSatisfactionScore;
        private List<ClientSegment> clientSegments;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientSegment {
        private String segment;
        private Integer count;
        private Double percentage;
        private String color;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamPerformance {
        private Integer totalMembers;
        private Double averagePerformanceScore;
        private List<MemberPerformance> topPerformers;
        private List<MetricData> teamMetrics;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberPerformance {
        private String name;
        private String role;
        private Double score;
        private Integer salesCount;
        private Double revenue;
        private String avatar;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketInsights {
        private String marketTrend; // "growing", "stable", "declining"
        private Double marketGrowthRate;
        private List<MarketData> competitorAnalysis;
        private List<PriceInsight> priceInsights;
        private List<String> recommendations;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketData {
        private String competitorName;
        private Integer marketShare;
        private String color;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceInsight {
        private String location;
        private Double averagePrice;
        private Double priceChange;
        private String trend;
    }
}