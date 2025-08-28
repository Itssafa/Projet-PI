package esprit.user.service;

import esprit.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.email.from:noreply@immobilier.com}")
    private String fromEmail;

    public void sendVerificationEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Vérification de votre compte - Plateforme Immobilière");
            
            String verificationUrl = baseUrl + "/api/auth/verify?token=" + user.getVerificationToken();
            String emailBody = String.format(
                "Bonjour %s %s,\n\n" +
                "Merci de vous être inscrit sur notre plateforme immobilière.\n" +
                "Pour activer votre compte, veuillez cliquer sur le lien suivant :\n\n" +
                "%s\n\n" +
                "Ce lien expirera dans 24 heures.\n\n" +
                "Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email.\n\n" +
                "Cordialement,\n" +
                "L'équipe de la Plateforme Immobilière",
                user.getPrenom(),
                user.getNom(),
                verificationUrl
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Email de vérification envoyé à : {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de vérification à {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email de vérification", e);
        }
    }

    public void sendWelcomeEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Bienvenue sur la Plateforme Immobilière");
            
            String emailBody = String.format(
                "Bonjour %s %s,\n\n" +
                "Félicitations ! Votre compte a été vérifié avec succès.\n" +
                "Vous pouvez maintenant profiter de toutes les fonctionnalités de notre plateforme.\n\n" +
                "Connectez-vous dès maintenant : %s/login\n\n" +
                "Cordialement,\n" +
                "L'équipe de la Plateforme Immobilière",
                user.getPrenom(),
                user.getNom(),
                baseUrl
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Email de bienvenue envoyé à : {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de bienvenue à {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    public void sendWelcomeEmailAsync(User user) {
        // Version asynchrone pour éviter les blocages
        new Thread(() -> sendWelcomeEmail(user)).start();
    }

    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Réinitialisation de votre mot de passe");
            
            String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
            String emailBody = String.format(
                "Bonjour %s %s,\n\n" +
                "Vous avez demandé à réinitialiser votre mot de passe.\n" +
                "Cliquez sur le lien suivant pour créer un nouveau mot de passe :\n\n" +
                "%s\n\n" +
                "Ce lien expirera dans 1 heure.\n\n" +
                "Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.\n\n" +
                "Cordialement,\n" +
                "L'équipe de la Plateforme Immobilière",
                user.getPrenom(),
                user.getNom(),
                resetUrl
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Email de réinitialisation envoyé à : {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de réinitialisation à {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email de réinitialisation", e);
        }
    }
}