package esprit.user.entity;

public enum SubscriptionType {
    BASIC(10, 30),
    PREMIUM(50, 90),
    ENTERPRISE(Integer.MAX_VALUE, 365);

    private final int maxSearchesPerDay;
    private final int durationInDays;

    SubscriptionType(int maxSearchesPerDay, int durationInDays) {
        this.maxSearchesPerDay = maxSearchesPerDay;
        this.durationInDays = durationInDays;
    }

    public int getMaxSearchesPerDay() {
        return maxSearchesPerDay;
    }

    public int getDurationInDays() {
        return durationInDays;
    }
}