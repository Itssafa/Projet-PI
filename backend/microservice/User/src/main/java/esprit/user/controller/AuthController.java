package esprit.user.controller;

import esprit.user.dto.*;
import esprit.user.entity.User;
import esprit.user.service.JwtService;
import esprit.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDto registrationDto) {
        log.info("Tentative d'inscription pour l'email: {}", registrationDto.getEmail());
        
        try {
            User user = userService.registerUser(registrationDto);
            UserResponseDto userResponse = userService.convertToDto(user);
            
            log.info("Inscription réussie pour l'email: {}", registrationDto.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "message", "Utilisateur créé avec succès. Vérifiez votre email pour activer votre compte.",
                    "user", userResponse
                ));
        } catch (RuntimeException e) {
            log.error("Erreur lors de l'inscription pour {}: {}", registrationDto.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", java.time.LocalDateTime.now()
                ));
        } catch (Exception e) {
            log.error("Erreur inattendue lors de l'inscription: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Erreur interne du serveur",
                    "timestamp", java.time.LocalDateTime.now()
                ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDto loginDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginDto.getEmail(),
                    loginDto.getMotDePasse()
                )
            );

            User user = (User) authentication.getPrincipal();
            
            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Veuillez vérifier votre email avant de vous connecter"));
            }

            String jwt = jwtService.generateToken(user);
            userService.updateLastLogin(user.getEmail());
            
            UserResponseDto userResponse = userService.convertToDto(user);
            LoginResponseDto loginResponse = new LoginResponseDto(jwt, userResponse);
            
            return ResponseEntity.ok(loginResponse);
        } catch (BadCredentialsException e) {
            log.error("Tentative de connexion avec des identifiants incorrects pour: {}", loginDto.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Email ou mot de passe incorrect"));
        } catch (Exception e) {
            log.error("Erreur lors de la connexion: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = userService.verifyEmail(token);
            if (verified) {
                return ResponseEntity.ok(Map.of("message", "Email vérifié avec succès. Vous pouvez maintenant vous connecter."));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Token de vérification invalide ou expiré"));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la vérification d'email: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> userOpt = userService.findByEmail(email);
            
            if (userOpt.isPresent()) {
                UserResponseDto userResponse = userService.convertToDto(userOpt.get());
                return ResponseEntity.ok(userResponse);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du profil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserRegistrationDto updateDto, 
                                          Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> userOpt = userService.findByEmail(email);
            
            if (userOpt.isPresent()) {
                User updatedUser = userService.updateUser(userOpt.get().getId(), updateDto);
                UserResponseDto userResponse = userService.convertToDto(updatedUser);
                return ResponseEntity.ok(userResponse);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du profil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur interne du serveur"));
        }
    }
}