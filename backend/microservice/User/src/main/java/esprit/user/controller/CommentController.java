package esprit.user.controller;

import esprit.user.dto.CommentCreateRequest;
import esprit.user.dto.CommentResponse;
import esprit.user.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @PostMapping("/annonce/{annonceId}")
    public ResponseEntity<Map<String, Object>> createComment(
            @PathVariable Long annonceId,
            @Valid @RequestBody CommentCreateRequest request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authentication == null || authentication.getName() == null) {
                response.put("success", false);
                response.put("message", "Authentification requise");
                return ResponseEntity.status(401).body(response);
            }
            
            CommentResponse comment = commentService.createComment(annonceId, request, authentication.getName());
            
            response.put("success", true);
            response.put("message", "Commentaire ajouté avec succès");
            response.put("comment", comment);
            
            return ResponseEntity.status(201).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
            
        } catch (RuntimeException e) {
            String message = e.getMessage();
            if (message.contains("non trouvé")) {
                response.put("success", false);
                response.put("message", message);
                return ResponseEntity.status(404).body(response);
            } else {
                response.put("success", false);
                response.put("message", "Erreur lors de l'ajout du commentaire: " + message);
                return ResponseEntity.status(400).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur interne du serveur");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/annonce/{annonceId}")
    public ResponseEntity<?> getCommentsByAnnonce(@PathVariable Long annonceId) {
        try {
            List<CommentResponse> comments = commentService.getCommentsByAnnonceId(annonceId);
            return ResponseEntity.ok(comments);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des commentaires");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/annonce/{annonceId}/stats")
    public ResponseEntity<Map<String, Object>> getAnnonceCommentStats(@PathVariable Long annonceId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Double averageRating = commentService.getAverageRating(annonceId);
            Long commentCount = commentService.getCommentCount(annonceId);
            
            response.put("success", true);
            response.put("averageRating", averageRating);
            response.put("commentCount", commentCount);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des statistiques");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/my-annonces")
    public ResponseEntity<?> getCommentsForMyAnnonces(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        try {
            if (authentication == null || authentication.getName() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Authentification requise");
                return ResponseEntity.status(401).body(response);
            }
            
            Page<CommentResponse> comments = commentService.getCommentsForUserAnnonces(
                authentication.getName(), page, size);
            return ResponseEntity.ok(comments);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
            
        } catch (RuntimeException e) {
            String message = e.getMessage();
            Map<String, Object> response = new HashMap<>();
            if (message.contains("non trouvé")) {
                response.put("success", false);
                response.put("message", message);
                return ResponseEntity.status(404).body(response);
            } else {
                response.put("success", false);
                response.put("message", "Erreur lors de la récupération des commentaires");
                return ResponseEntity.status(400).body(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur interne du serveur");
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/reply/{parentCommentId}")
    public ResponseEntity<Map<String, Object>> createReply(
            @PathVariable Long parentCommentId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authentication == null || authentication.getName() == null) {
                response.put("success", false);
                response.put("message", "Authentification requise");
                return ResponseEntity.status(401).body(response);
            }
            
            String replyContent = request.get("content");
            if (replyContent == null || replyContent.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Le contenu de la réponse est requis");
                return ResponseEntity.status(400).body(response);
            }
            
            CommentResponse reply = commentService.createReply(parentCommentId, replyContent, authentication.getName());
            
            response.put("success", true);
            response.put("message", "Réponse ajoutée avec succès");
            response.put("reply", reply);
            
            return ResponseEntity.status(201).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
            
        } catch (RuntimeException e) {
            String message = e.getMessage();
            if (message.contains("non trouvé")) {
                response.put("success", false);
                response.put("message", message);
                return ResponseEntity.status(404).body(response);
            } else {
                response.put("success", false);
                response.put("message", message);
                return ResponseEntity.status(403).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur interne du serveur");
            return ResponseEntity.status(500).body(response);
        }
    }
}