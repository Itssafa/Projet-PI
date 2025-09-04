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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import esprit.user.entity.UserType;

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
    System.out.println("🔍 [CommentService] Creating reply - parentCommentId: " + parentCommentId + ", userEmail: " + userEmail);
    
    // Find parent comment
    Comment parentComment = commentRepository.findById(parentCommentId)
        .orElseThrow(() -> new RuntimeException("Commentaire parent non trouvé"));
    
    System.out.println("✅ [CommentService] Parent comment found: " + parentComment.getId());
    
    // Find user
    User user = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    
    System.out.println("✅ [CommentService] User found: " + user.getEmail() + " (" + user.getUserType() + ")");
    
    // Get the annonce from parent comment
    Annonce annonce = parentComment.getAnnonce();
    System.out.println("✅ [CommentService] Annonce found: " + annonce.getId() + ", owner: " + annonce.getCreateur().getEmail());
    
    // Check if user can reply (must be annonce owner OR admin)
    boolean canReply = annonce.getCreateur().getId().equals(user.getId()) ||
                       user.getUserType() == UserType.ADMINISTRATEUR;
    
    System.out.println("🔐 [CommentService] Permission check - canReply: " + canReply);
    System.out.println("    - User ID: " + user.getId() + ", Annonce owner ID: " + annonce.getCreateur().getId());
    System.out.println("    - Is same user: " + annonce.getCreateur().getId().equals(user.getId()));
    System.out.println("    - Is admin: " + (user.getUserType() == UserType.ADMINISTRATEUR));
    
    if (!canReply) {
        throw new RuntimeException("Seul le propriétaire de l'annonce peut répondre aux commentaires");
    }
    
    // Create reply comment (without rating validation)
    Comment reply = new Comment();
    reply.setContent(replyContent);
    reply.setUser(user);
    reply.setAnnonce(annonce);
    reply.setParentComment(parentComment);
    reply.setRating(0); // Set 0 for replies (no rating)
    reply.setCreatedAt(LocalDateTime.now());
    reply.setUpdatedAt(LocalDateTime.now());
    
    System.out.println("💾 [CommentService] Saving reply...");
    reply = commentRepository.save(reply);
    System.out.println("✅ [CommentService] Reply saved with ID: " + reply.getId());
    
    return new CommentResponse(reply);
}
}