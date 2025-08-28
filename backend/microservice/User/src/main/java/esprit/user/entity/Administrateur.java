package esprit.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@DiscriminatorValue("ADMINISTRATEUR")
public class Administrateur extends User {

    @Enumerated(EnumType.STRING)
    @Column(name = "admin_level")
    private AdminLevel adminLevel = AdminLevel.STANDARD;

    @Column(name = "department")
    private String department;

    @Column(name = "can_manage_users")
    private boolean canManageUsers = true;

    @Column(name = "can_manage_agencies")
    private boolean canManageAgencies = false;

    @Column(name = "can_view_analytics")
    private boolean canViewAnalytics = true;

    @Column(name = "can_manage_system")
    private boolean canManageSystem = false;

    @Column(name = "last_admin_action")
    private LocalDateTime lastAdminAction;

    public boolean hasPermission(String permission) {
        return switch (permission.toLowerCase()) {
            case "manage_users" -> canManageUsers;
            case "manage_agencies" -> canManageAgencies;
            case "view_analytics" -> canViewAnalytics;
            case "manage_system" -> canManageSystem;
            default -> false;
        };
    }
}