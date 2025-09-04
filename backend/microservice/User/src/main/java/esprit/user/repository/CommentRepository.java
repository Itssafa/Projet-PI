package esprit.user.repository;

import esprit.user.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByAnnonceIdOrderByCreatedAtDesc(Long annonceId);
    
    Page<Comment> findByAnnonceIdOrderByCreatedAtDesc(Long annonceId, Pageable pageable);
    
    @Query("SELECT AVG(c.rating) FROM Comment c WHERE c.annonce.id = :annonceId")
    Double getAverageRatingByAnnonceId(@Param("annonceId") Long annonceId);
    
    Long countByAnnonceId(Long annonceId);
    
    @Query("SELECT c FROM Comment c WHERE c.annonce.createur.id = :userId ORDER BY c.createdAt DESC")
    Page<Comment> findCommentsForUserAnnonces(@Param("userId") Long userId, Pageable pageable);
}