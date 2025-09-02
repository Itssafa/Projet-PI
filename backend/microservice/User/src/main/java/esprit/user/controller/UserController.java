package esprit.user.controller;

import esprit.user.dto.UserRegistrationDto;
import esprit.user.dto.UserResponseDto;
import esprit.user.dto.UserUpdateRequest;
import esprit.user.dto.PasswordChangeRequest;
import esprit.user.entity.User;
import esprit.user.entity.UserStatus;
import esprit.user.entity.UserType;
import esprit.user.service.UserService;
import esprit.user.service.StatisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"}, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final StatisticsService statisticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponseDto> userDtos = users.stream()
            .map(userService::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> getUsersByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        try {
            Page<User> userPage = userService.getUsersByPage(page, size, sortBy, sortDir);
            List<UserResponseDto> userDtos = userPage.getContent().stream()
                .map(userService::convertToDto)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "users", userDtos,
                "totalPages", userPage.getTotalPages(),
                "totalElements", userPage.getTotalElements(),
                "currentPage", page,
                "pageSize", size
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs paginés: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/{id:[0-9]+}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or @userService.getUserById(#id).get().email == authentication.name")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            UserResponseDto userDto = userService.convertToDto(userOpt.get());
            return ResponseEntity.ok(userDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isPresent()) {
                UserResponseDto userDto = userService.convertToDto(userOpt.get());
                return ResponseEntity.ok(userDto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'utilisateur actuel: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserUpdateRequest updateRequest,
                                         Authentication authentication) {
        try {
            // Debug logging per ChatGPT's suggestion
            log.info("UpdateProfile endpoint - Authentication: {}", authentication);
            log.info("UpdateProfile endpoint - Principal: {}", authentication != null ? authentication.getName() : "null");
            log.info("UpdateProfile endpoint - Update data: {}", updateRequest);
            
            String email = authentication.getName();
            User updatedUser = userService.updateCurrentUser(email, updateRequest);
            UserResponseDto userDto = userService.convertToDto(updatedUser);
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour du profil: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la mise à jour du profil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/type/{userType}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UserResponseDto>> getUsersByType(@PathVariable UserType userType) {
        List<User> users = userService.getUsersByType(userType);
        List<UserResponseDto> userDtos = users.stream()
            .map(userService::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UserResponseDto>> getUsersByStatus(@PathVariable UserStatus status) {
        List<User> users = userService.getUsersByStatus(status);
        List<UserResponseDto> userDtos = users.stream()
            .map(userService::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or @userService.getUserById(#id).get().email == authentication.name")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserRegistrationDto updateDto) {
        try {
            User updatedUser = userService.updateUser(id, updateDto);
            UserResponseDto userDto = userService.convertToDto(updatedUser);
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de l'utilisateur {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la mise à jour de l'utilisateur {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la suppression de l'utilisateur {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la suppression de l'utilisateur {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UserResponseDto>> searchUsers(@RequestParam String keyword) {
        List<User> users = userService.searchUsers(keyword);
        List<UserResponseDto> userDtos = users.stream()
            .map(userService::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // For regular users, return basic stats
            Map<String, Object> userStats = Map.of(
                "userType", user.getUserType(),
                "status", user.getStatus(),
                "emailVerified", user.isEmailVerified(),
                "createdAt", user.getCreatedAt(),
                "lastLogin", user.getLastLogin()
            );
            
            return ResponseEntity.ok(userStats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des statistiques utilisateur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest passwordRequest, 
                                          Authentication authentication) {
        try {
            String email = authentication.getName();
            userService.changePassword(email, passwordRequest.getCurrentPassword(), passwordRequest.getNewPassword());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mot de passe changé avec succès"
            ));
        } catch (RuntimeException e) {
            log.error("Erreur lors du changement de mot de passe: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "error", e.getMessage()
                ));
        } catch (Exception e) {
            log.error("Erreur interne lors du changement de mot de passe: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "error", "Erreur interne du serveur"
                ));
        }
    }

    @PostMapping("/verify-agency/{agencyId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> verifyAgency(@PathVariable Long agencyId) {
        try {
            userService.verifyAgency(agencyId);
            return ResponseEntity.ok(Map.of("message", "Agence vérifiée avec succès"));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la vérification de l'agence {}: {}", agencyId, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur interne lors de la vérification de l'agence {}: {}", agencyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }
}