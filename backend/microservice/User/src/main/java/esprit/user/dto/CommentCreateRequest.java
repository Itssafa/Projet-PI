 package esprit.user.dto;

import jakarta.validation.constraints.*;

public class CommentCreateRequest {
    @NotBlank(message = "Le commentaire ne peut pas être vide")
    @Size(max = 1000, message = "Le commentaire ne peut pas dépasser 1000 caractères")
    private String content;
    
    @NotNull(message = "La note est requise")
    @Min(value = 1, message = "La note doit être entre 1 et 5")
    @Max(value = 5, message = "La note doit être entre 1 et 5")
    private Integer rating;
    
    // Constructors
    public CommentCreateRequest() {}
    
    public CommentCreateRequest(String content, Integer rating) {
        this.content = content;
        this.rating = rating;
    }
    
    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}