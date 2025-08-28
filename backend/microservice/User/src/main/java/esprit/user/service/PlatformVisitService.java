package esprit.user.service;

import esprit.user.entity.PlatformVisit;
import esprit.user.entity.User;
import esprit.user.repository.PlatformVisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PlatformVisitService {

    private final PlatformVisitRepository platformVisitRepository;

    public PlatformVisit recordVisit(String ipAddress, String userAgent, String sessionId, 
                                   User user, String pageUrl) {
        PlatformVisit visit = new PlatformVisit();
        visit.setIpAddress(ipAddress);
        visit.setUserAgent(userAgent);
        visit.setSessionId(sessionId);
        visit.setUser(user);
        visit.setPageUrl(pageUrl);
        visit.setVisitDate(LocalDate.now());
        visit.setVisitTimestamp(LocalDateTime.now());
        
        return platformVisitRepository.save(visit);
    }

    public void updateVisitDuration(Long visitId, long durationSeconds) {
        platformVisitRepository.findById(visitId).ifPresent(visit -> {
            visit.setDurationSeconds(durationSeconds);
            platformVisitRepository.save(visit);
        });
    }
}