package esprit.user.service;

import esprit.user.dto.*;
import esprit.user.entity.*;
import esprit.user.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AgenceImmobiliereRepository agenceImmobiliereRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    @Value("${app.email.verification.enabled:true}")
    private boolean emailVerificationEnabled;

    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        User user = createUserByType(registrationDto);
        user.setMotDePasse(passwordEncoder.encode(registrationDto.getMotDePasse()));
        
        if (emailVerificationEnabled) {
            // Production mode: email verification required
            user.setVerificationToken(UUID.randomUUID().toString());
            user.setStatus(UserStatus.PENDING);
            user.setEmailVerified(false);
            
            User savedUser = userRepository.save(user);
            try {
                emailService.sendVerificationEmail(savedUser);
                log.info("Email de vérification envoyé à : {}", savedUser.getEmail());
            } catch (Exception e) {
                log.error("Erreur lors de l'envoi de l'email de vérification : {}", e.getMessage());
                throw new RuntimeException("Erreur lors de l'envoi de l'email de vérification");
            }
            return savedUser;
        } else {
            // Development mode: skip email verification
            user.setVerificationToken(null);
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(true);
            
            User savedUser = userRepository.save(user);
            log.info("Utilisateur créé et activé automatiquement (mode développement) : {}", savedUser.getEmail());
            return savedUser;
        }
    }

    private User createUserByType(UserRegistrationDto dto) {
        return switch (dto.getUserType()) {
            case CLIENT_ABONNE -> {
                ClientAbonne client = new ClientAbonne();
                populateBaseUserFields(client, dto);
                yield client;
            }
            case AGENCE_IMMOBILIERE -> {
                if (agenceImmobiliereRepository.existsByNumeroLicence(dto.getNumeroLicence())) {
                    throw new RuntimeException("Une agence avec ce numéro de licence existe déjà");
                }
                AgenceImmobiliere agence = new AgenceImmobiliere();
                populateBaseUserFields(agence, dto);
                agence.setNomAgence(dto.getNomAgence());
                agence.setNumeroLicence(dto.getNumeroLicence());
                agence.setSiteWeb(dto.getSiteWeb());
                agence.setNombreEmployes(dto.getNombreEmployes());
                agence.setZonesCouverture(dto.getZonesCouverture());
                yield agence;
            }
            case ADMINISTRATEUR -> {
                Administrateur admin = new Administrateur();
                populateBaseUserFields(admin, dto);
                yield admin;
            }
            default -> {
                RegularUser user = new RegularUser();
                populateBaseUserFields(user, dto);
                yield user;
            }
        };
    }

    private void populateBaseUserFields(User user, UserRegistrationDto dto) {
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());
        user.setTelephone(dto.getTelephone());
        user.setAdresse(dto.getAdresse());
    }

    public boolean verifyEmail(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEmailVerified(true);
            user.setStatus(UserStatus.ACTIVE);
            user.setVerificationToken(null);
            User savedUser = userRepository.save(user);
            
            // Envoyer l'email de bienvenue de manière asynchrone
            try {
                emailService.sendWelcomeEmailAsync(savedUser);
            } catch (Exception e) {
                // Log l'erreur mais ne pas faire échouer la vérification
                System.err.println("Erreur envoi email bienvenue: " + e.getMessage());
            }
            
            return true;
        }
        return false;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void updateLastLogin(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        userOpt.ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> getUsersByPage(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findAll(pageable);
    }

    public List<User> getUsersByType(UserType userType) {
        return userRepository.findByUserType(userType);
    }

    public List<User> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, UserRegistrationDto updateDto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setNom(updateDto.getNom());
        user.setPrenom(updateDto.getPrenom());
        user.setTelephone(updateDto.getTelephone());
        user.setAdresse(updateDto.getAdresse());

        if (user instanceof AgenceImmobiliere agence && updateDto.getUserType() == UserType.AGENCE_IMMOBILIERE) {
            agence.setNomAgence(updateDto.getNomAgence());
            agence.setSiteWeb(updateDto.getSiteWeb());
            agence.setNombreEmployes(updateDto.getNombreEmployes());
            agence.setZonesCouverture(updateDto.getZonesCouverture());
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.findByKeyword(keyword);
    }

    public void verifyAgency(Long agencyId) {
        AgenceImmobiliere agence = agenceImmobiliereRepository.findById(agencyId)
            .orElseThrow(() -> new RuntimeException("Agence non trouvée"));
        agence.setVerified(true);
        agenceImmobiliereRepository.save(agence);
    }

    public User updateCurrentUser(String email, UserUpdateRequest updateRequest) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Update basic fields only if provided (partial update)
        if (updateRequest.getNom() != null) {
            user.setNom(updateRequest.getNom());
        }
        if (updateRequest.getPrenom() != null) {
            user.setPrenom(updateRequest.getPrenom());
        }
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equalsIgnoreCase(user.getEmail())) {
            // Check if new email is unique
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                throw new RuntimeException("Cet email est déjà utilisé");
            }
            user.setEmail(updateRequest.getEmail());
        }
        if (updateRequest.getTelephone() != null) {
            user.setTelephone(updateRequest.getTelephone());
        }
        if (updateRequest.getAdresse() != null) {
            user.setAdresse(updateRequest.getAdresse());
        }

        // Update role-specific fields
        if (user instanceof AgenceImmobiliere agence) {
            if (updateRequest.getNomAgence() != null) {
                agence.setNomAgence(updateRequest.getNomAgence());
            }
            if (updateRequest.getNumeroLicence() != null) {
                agence.setNumeroLicence(updateRequest.getNumeroLicence());
            }
            if (updateRequest.getSiteWeb() != null) {
                agence.setSiteWeb(updateRequest.getSiteWeb());
            }
            if (updateRequest.getNombreEmployes() != null) {
                agence.setNombreEmployes(updateRequest.getNombreEmployes());
            }
            if (updateRequest.getZonesCouverture() != null) {
                agence.setZonesCouverture(updateRequest.getZonesCouverture());
            }
        }

        if (user instanceof ClientAbonne client) {
            if (updateRequest.getSubscriptionType() != null) {
                client.setSubscriptionType(SubscriptionType.valueOf(updateRequest.getSubscriptionType()));
            }
        }

        if (user instanceof Administrateur admin) {
            if (updateRequest.getAdminLevel() != null) {
                admin.setAdminLevel(AdminLevel.valueOf(updateRequest.getAdminLevel()));
            }
            if (updateRequest.getDepartment() != null) {
                admin.setDepartment(updateRequest.getDepartment());
            }
        }

        return userRepository.save(user);
    }

    public UserResponseDto convertToDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setAdresse(user.getAdresse());
        dto.setUserType(user.getUserType());
        dto.setStatus(user.getStatus());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        
        // Add agency-specific fields if user is an agency
        if (user instanceof AgenceImmobiliere) {
            AgenceImmobiliere agency = (AgenceImmobiliere) user;
            dto.setNomAgence(agency.getNomAgence());
            dto.setNumeroLicence(agency.getNumeroLicence());
            dto.setSiteWeb(agency.getSiteWeb());
            dto.setNombreEmployes(agency.getNombreEmployes());
            dto.setZonesCouverture(agency.getZonesCouverture());
            dto.setVerified(agency.isVerified());
        }
        
        return dto;
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getMotDePasse())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        // Check if new password is different from current
        if (passwordEncoder.matches(newPassword, user.getMotDePasse())) {
            throw new RuntimeException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        // Update password
        user.setMotDePasse(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Mot de passe changé avec succès pour l'utilisateur: {}", email);
    }
}