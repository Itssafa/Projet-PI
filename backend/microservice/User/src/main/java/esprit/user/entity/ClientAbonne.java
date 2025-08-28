package esprit.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@DiscriminatorValue("CLIENT_ABONNE")
public class ClientAbonne extends User {

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType = SubscriptionType.BASIC;

    @Column(name = "subscription_start_date")
    private LocalDate subscriptionStartDate = LocalDate.now();

    @Column(name = "subscription_end_date")
    private LocalDate subscriptionEndDate;

    @Column(name = "max_searches_per_day")
    private Integer maxSearchesPerDay = 10;

    @Column(name = "current_searches_today")
    private Integer currentSearchesToday = 0;

    @Column(name = "last_search_reset")
    private LocalDate lastSearchReset = LocalDate.now();

    public boolean canSearch() {
        if (!LocalDate.now().equals(lastSearchReset)) {
            currentSearchesToday = 0;
            lastSearchReset = LocalDate.now();
        }
        return currentSearchesToday < maxSearchesPerDay;
    }

    public void incrementSearchCount() {
        if (!LocalDate.now().equals(lastSearchReset)) {
            currentSearchesToday = 0;
            lastSearchReset = LocalDate.now();
        }
        currentSearchesToday++;
    }
}