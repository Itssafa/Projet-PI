package esprit.user.service;

import esprit.user.entity.Annonce;
import esprit.user.entity.Comment;
import esprit.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Async
    public void notifyNewComment(User annonceOwner, Annonce annonce, Comment comment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(annonceOwner.getEmail());
            message.setSubject("Nouveau commentaire sur votre annonce - ImmoConnect");
            message.setText(buildCommentNotificationText(annonceOwner, annonce, comment));
            
            mailSender.send(message);
            logger.info("Notification email sent to {} for new comment on annonce {}", 
                       annonceOwner.getEmail(), annonce.getId());
        } catch (Exception e) {
            logger.error("Failed to send notification email to {}: {}", 
                        annonceOwner.getEmail(), e.getMessage());
        }
    }
    
    private String buildCommentNotificationText(User annonceOwner, Annonce annonce, Comment comment) {
        return String.format(
            "Bonjour %s,\n\n" +
            "Vous avez reçu un nouveau commentaire sur votre annonce \"%s\".\n\n" +
            "Commentaire de %s:\n" +
            "\"%s\"\n\n" +
            "Note: %d/5 étoiles\n\n" +
            "Vous pouvez consulter tous vos commentaires sur votre tableau de bord ImmoConnect.\n\n" +
            "Cordialement,\n" +
            "L'équipe ImmoConnect",
            annonceOwner.getPrenom(),
            annonce.getTitre(),
            comment.getUser().getPrenom() + " " + comment.getUser().getNom(),
            comment.getContent(),
            comment.getRating()
        );
    }
}