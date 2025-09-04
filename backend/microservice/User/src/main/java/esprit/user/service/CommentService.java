package esprit.user.service;

import esprit.user.dto.CommentCreateRequest;
import esprit.user.dto.CommentResponse;
import esprit.user.entity.Annonce;
import esprit.user.entity.Comment;
import esprit.user.entity.User;
import esprit.user.repository.AnnonceRepository;
import esprit.user.repository.CommentRepository;
import esprit.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private AnnonceRepository annonceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public CommentResponse createComment(Long annonceId, CommentCreateRequest request, String userEmail) {
        try {
            // Validate input
            if (annonceId == null || annonceId <= 0) {
                throw new IllegalArgumentException("ID de l'annonce invalide");
            }
            
            if (request == null) {
                throw new IllegalArgumentException("Les données du commentaire sont requises");
            }
            
            // Find the user
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + userEmail));
            
            // Find the annonce
            Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new RuntimeException("Annonce non trouvée avec l'ID: " + annonceId));
            
            // Validate that user can comment (not disabled)
            if (!user.isEnabled()) {
                throw new RuntimeException("Votre compte n'est pas activé. Vous ne pouvez pas commenter.");
            }
            
            // Create the comment
            Comment comment = new Comment(request.getContent(), request.getRating(), annonce, user);
            Comment savedComment = commentRepository.save(comment);
            
            // Send notification to the agency/owner asynchronously
            if (!annonce.getCreateur().getId().equals(user.getId())) {
                try {
                    notificationService.notifyNewComment(annonce.getCreateur(), annonce, savedComment);
                } catch (Exception e) {
                    // Log error but don't fail the comment creation
                    System.err.println("Failed to send notification: " + e.getMessage());
                }
            }
            
            return new CommentResponse(savedComment);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du commentaire: " + e.getMessage(), e);
        }
    }
    
    public List<CommentResponse> getCommentsByAnnonceId(Long annonceId) {
        if (annonceId == null || annonceId <= 0) {
            throw new IllegalArgumentException("ID de l'annonce invalide");
        }
        
        List<Comment> comments = commentRepository.findByAnnonceIdAndParentCommentIsNullOrderByCreatedAtDesc(annonceId);
        return comments.stream()
            .map(CommentResponse::new)
            .collect(Collectors.toList());
    }
    
    public Page<CommentResponse> getCommentsByAnnonceId(Long annonceId, int page, int size) {
        if (annonceId == null || annonceId <= 0) {
            throw new IllegalArgumentException("ID de l'annonce invalide");
        }
        
        if (page < 0) {
            page = 0;
        }
        
        if (size <= 0 || size > 100) {
            size = 10;
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> comments = commentRepository.findByAnnonceIdAndParentCommentIsNullOrderByCreatedAtDesc(annonceId, pageable);
        return comments.map(CommentResponse::new);
    }
    
    public Double getAverageRating(Long annonceId) {
        if (annonceId == null || annonceId <= 0) {
            throw new IllegalArgumentException("ID de l'annonce invalide");
        }
        
        Double rating = commentRepository.getAverageRatingByAnnonceId(annonceId);
        return rating != null ? rating : 0.0;
    }
    
    public Long getCommentCount(Long annonceId) {
        if (annonceId == null || annonceId <= 0) {
            throw new IllegalArgumentException("ID de l'annonce invalide");
        }
        
        return commentRepository.countByAnnonceId(annonceId);
    }
    
    public Page<CommentResponse> getCommentsForUserAnnonces(String userEmail, int page, int size) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email utilisateur requis");
        }
        
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + userEmail));
        
        if (page < 0) {
            page = 0;
        }
        
        if (size <= 0 || size > 100) {
            size = 10;
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> comments = commentRepository.findCommentsForUserAnnonces(user.getId(), pageable);
        return comments.map(CommentResponse::new);
    }

    public CommentResponse createReply(Long parentCommentId, String replyContent, String userEmail) {
        try {
            // Validate input
            if (parentCommentId == null || parentCommentId <= 0) {
                throw new IllegalArgumentException("ID du commentaire parent invalide");
            }
            
            if (replyContent == null || replyContent.trim().isEmpty()) {
                throw new IllegalArgumentException("Le contenu de la réponse est requis");
            }
            
            // Find the parent comment
            Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Commentaire parent non trouvé avec l'ID: " + parentCommentId));
            
            // Find the user
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + userEmail));
            
            // Validate that user can reply (must be the annonce owner for replies)
            if (!parentComment.getAnnonce().getCreateur().getId().equals(user.getId())) {
                throw new RuntimeException("Seul le propriétaire de l'annonce peut répondre aux commentaires");
            }
            
            // Create the reply (rating is 0 for replies)
            Comment reply = new Comment(replyContent.trim(), 0, parentComment.getAnnonce(), user);
            reply.setParentComment(parentComment);
            Comment savedReply = commentRepository.save(reply);
            
            // Send notification to the original commenter
            try {
                notificationService.notifyNewComment(parentComment.getUser(), parentComment.getAnnonce(), savedReply);
            } catch (Exception e) {
                // Log error but don't fail the reply creation
                System.err.println("Failed to send reply notification: " + e.getMessage());
            }
            
            return new CommentResponse(savedReply);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la réponse: " + e.getMessage(), e);
        }
    }
}